# Plan de migración — Astro 5 → 6

Fecha: 2026-04-27
Branch base: `main` con `npm audit fix` (no-force) ya aplicado.

## Estado actual

```
21 vulnerabilidades originales
↓ npm audit fix (no-force, ya aplicado)
5 vulnerabilidades restantes (todas requieren breaking change)
```

### Vulnerabilidades pendientes

| # | Paquete | Severidad | CVE / GHSA | Bloqueador |
|---|---|---|---|---|
| 1 | `astro` < 6.1.6 | moderate | [GHSA-j687-52p2-xcff](https://github.com/advisories/GHSA-j687-52p2-xcff) — XSS en `define:vars` via `</script>` mal sanitizado | Major: Astro 5 → 6 |
| 2 | `@astrojs/vercel` < 10 | high | [GHSA-mr6q-rp88-fx84](https://github.com/advisories/GHSA-mr6q-rp88-fx84) — path override via `x-astro-path` | Major: requiere Astro 6 |
| 3 | `path-to-regexp` 4-6 | high | [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j) — ReDoS backtracking | Transitiva: dentro de `@vercel/routing-utils` → `@astrojs/vercel` |
| 4 | `@astrojs/tailwind` (incompat. con Astro 6) | — | — | Bloquea el upgrade: el integrador está deprecado |
| 5 | `@vercel/routing-utils` (transitiva) | high | Mismo path-to-regexp | Se resuelve con #2 |

### Análisis de exposición real

- **#1 (define:vars XSS):** En el código actual `define:vars` se usa en [ContactForm.astro:91](src/components/ContactForm.astro:91) (siteKey) y [index.astro:164](src/pages/index.astro:164) / [en/index.astro:163](src/pages/en/index.astro:163) (email). **Las tres variables son strings constantes desde código fuente**, no entran datos de usuario. Riesgo real hoy: **bajo**. Pero el patrón es frágil — cualquier futuro `define:vars` con datos dinámicos quedaría vulnerable.
- **#2 (x-astro-path):** Permite que un atacante mande un header `x-astro-path` y el server lo trate como ruta interna. En `output: 'server'` con Vercel adapter es explotable. **Riesgo real: medio** — depende de cómo Vercel propague el header.
- **#3 (path-to-regexp ReDoS):** ReDoS en el routing de Vercel. Necesita un patrón de ruta vulnerable; las rutas actuales son estáticas (`/`, `/en/`, `/email`). **Riesgo real: bajo**.

**Conclusión:** la migración no es urgente, pero conviene hacerla en el próximo ciclo de mantención.

---

## Estrategia general

Astro 6 trae cuatro cambios que afectan este repo:

1. **Tailwind:** `@astrojs/tailwind` está deprecado. La forma oficial en Astro 6 es usar Tailwind CSS v4 con `@tailwindcss/vite`. Esto es un upgrade de Tailwind también (v3 → v4).
2. **`@astrojs/vercel`:** v9 → v10. Cambia el nombre del adapter por defecto (antes `vercel/serverless`, ahora simplemente `vercel`); ya estamos en ese.
3. **API de Astro:** algunos cambios menores en tipos, `Astro.url`, content collections (no usamos), `set:html`, image service.
4. **Node version requirement:** Astro 6 requiere Node 20.10+ (ya cumplimos con 22.x).

La estrategia es hacer todo en una rama dedicada, probar paso a paso, y solo mergear cuando el sitio entero pase visual review.

---

## Fase 1 — Preparación (sin cambios funcionales)

```bash
git checkout -b chore/astro-6-upgrade
git push -u origin chore/astro-6-upgrade
```

Crea un deploy preview en Vercel para esta rama (Vercel lo hace automático). Vas a probar contra esta URL en cada fase.

**Snapshot del estado "antes":**
- [ ] Anota el tamaño del bundle: `du -sh dist/client/_astro/`
- [ ] Toma screenshots de las dos páginas (`/` y `/en/`) — desktop y mobile.
- [ ] Verifica que `/email` funciona end-to-end con un mensaje de prueba.

---

## Fase 2 — Tailwind v3 + `@astrojs/tailwind` → Tailwind v4 + `@tailwindcss/vite`

Esta es la fase más invasiva. Hazla **antes** de subir Astro, así separas las posibles fuentes de error.

### 2.1 Instalación

```bash
npm uninstall @astrojs/tailwind tailwindcss
npm install tailwindcss@^4 @tailwindcss/vite@^4
```

### 2.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://emersoftware.cl',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  output: 'server',
  adapter: vercel(),
});
```

### 2.3 Borrar `tailwind.config.mjs`, migrar safelist + theme a CSS

Tailwind v4 usa configuración **en CSS** (no en JS). Crea `src/styles/tailwind.css`:

```css
@import "tailwindcss";

@theme {
  --color-orange-50: #FFF7ED;
  --color-orange-100: #FFEDD5;
  --color-orange-200: #FED7AA;
  --color-orange-300: #FDBA74;
  --color-orange-400: #ED8936;
  --color-orange-500: #DD6B20;
  --color-orange-600: #C05621;
  --color-orange-700: #9C4221;

  --color-graphite-50: #F9FAFB;
  --color-graphite-100: #F3F4F6;
  --color-graphite-200: #E5E7EB;
  --color-graphite-300: #D1D5DB;
  --color-graphite-400: #9CA3AF;
  --color-graphite-500: #6B7280;
  --color-graphite-600: #4B5563;
  --color-graphite-700: #374151;
  --color-graphite-800: #1F2937;
  --color-graphite-900: #111827;

  --color-night: #0F172A;
  --color-night-50: #F8FAFC;
  /* … resto de night */

  --color-red: #FF0000;
}

/* Safelist v3 ya no es necesario en v4: el motor escanea includes igual,
   pero si compones clases dinámicamente, decláralas en @source o como utility:
*/
@source inline("bg-orange-400 bg-orange-500 bg-orange-600 hover:bg-orange-500 hover:bg-orange-600 text-orange-500 text-orange-600 text-orange-700 hover:text-orange-500 hover:text-orange-700 border-orange-500 hover:border-orange-500 focus:border-orange-500");
```

Importa este CSS en `src/layouts/Layout.astro`:
```astro
import '../styles/tailwind.css';
```

Borra `tailwind.config.mjs`.

### 2.4 Audita clases que cambien de nombre en v4

Cambios de utility names a vigilar (`grep` en `src/`):
- `space-x-*` y `space-y-*` siguen funcionando.
- `flex-shrink-*` → `shrink-*` (ya en uso).
- `flex-grow-*` → `grow-*`.
- `transition-all` con valores extendidos: revisar.
- Custom colors: ya migrados arriba, deberían funcionar.

```bash
# Comprueba que no haya clases obsoletas
grep -rE 'flex-shrink|flex-grow' src/
```

### 2.5 Verificación visual

```bash
npm run dev
```

Compara contra los screenshots de Fase 1. Si hay regresión:
- Espacios entre elementos (cambió rounding pero raro).
- Sombras (en v4 son ligeramente distintas en intensidad).
- `backdrop-blur-md` (verificar que sigue funcionando, lo usas en navbar).

Commit:
```bash
git commit -am "chore: migrate to tailwind v4 + @tailwindcss/vite"
```

---

## Fase 3 — Astro 5 → 6 + `@astrojs/vercel` 9 → 10

### 3.1 Upgrade

```bash
npm install astro@^6 @astrojs/vercel@^10
npx @astrojs/upgrade  # corre el migrator oficial si lo provee
```

### 3.2 Breaking changes a revisar

Mira la [guía oficial](https://docs.astro.build/en/guides/upgrade-to/v6/) y verifica en este repo:

| Cambio | Archivo a revisar | Acción |
|---|---|---|
| `Astro.url` ahora es read-only `URL` (igual) | [src/middleware.ts](src/middleware.ts), [src/layouts/Layout.astro](src/layouts/Layout.astro) | Verificar que ningún código mute `Astro.url` |
| Middleware: `context.redirect` cambió tipos | [src/middleware.ts:99-101](src/middleware.ts) | Probablemente sin cambios, verificar tipos con `npx astro check` |
| `set:html` ahora trata strings como literales | [src/components/Contact.astro:15](src/components/Contact.astro) (`Fragment set:html={t.contact.success}`) | El `<br />` en el dictionary se renderiza igual; verificar que no escape |
| `define:vars` parche XSS aplicado | [ContactForm.astro:91](src/components/ContactForm.astro), [index.astro:164](src/pages/index.astro) | Comportamiento debería ser idéntico para strings sin `</script>` |
| Image service por defecto cambia | (no usamos `<Image>`) | N/A |
| Content collections API | (no usamos) | N/A |
| `prerender` semantics | [404.astro:1](src/pages/404.astro), [en/index.astro:1](src/pages/en/index.astro) | Sin cambios esperados |
| Sitemap integration tipos | `astro.config.mjs` | `@astrojs/sitemap@^3` puede necesitar bump a `^4` si sale |

### 3.3 Astro check

```bash
npx astro check
```

Itera sobre los errores de tipo. Los más probables:
- `Astro.props as Props` ya no necesita el cast → quita los `as Props` redundantes.
- `MiddlewareHandler` puede haber cambiado su firma exacta.

### 3.4 Build local

```bash
npm run build
```

Errores esperables y cómo resolverlos:
- "Cannot find module '@astrojs/tailwind'": ya no existe, quítate el import si quedó alguno.
- "vite plugin order": ajustar orden en `vite.plugins`.
- "Cache-Control header conflict": Astro 6 puede normalizar mejor headers; revisar [GitHubLatestCommit.astro:51](src/components/GitHubLatestCommit.astro).

### 3.5 Smoke test

```bash
npm run preview
```

Abre `http://localhost:4321` y prueba:
- [ ] `/` carga, hero se ve bien, navbar funciona
- [ ] `/en/` carga (debería ser estático)
- [ ] Cambio de idioma `/` ↔ `/en/`
- [ ] Botón copiar email (desktop y mobile)
- [ ] Form de contacto manda mensaje (necesitas las env vars locales)
- [ ] El widget de GitHub commit se renderiza
- [ ] Visita `https://localhost:4321/en/no-existe` → debe servir el `404.html`

Commit:
```bash
git commit -am "chore: upgrade astro 5 → 6, @astrojs/vercel 9 → 10"
```

---

## Fase 4 — Deploy preview y QA

```bash
git push
```

Vercel genera URL de preview automática. Pruébala en:
- [ ] Chrome desktop, Safari mobile (iPhone simulator)
- [ ] Lighthouse: comparar score vs `main` actual (no debería bajar)
- [ ] Headers: `curl -I` a `/` debe devolver `Cache-Control` correcto
- [ ] Form de contacto: enviar test real y verificar que llegue a tu Gmail

---

## Fase 5 — Merge

```bash
npm audit
# Esperado: 0 vulnerabilidades, o como mucho transitivas no críticas.
```

Si todo pasa:
```bash
git checkout main
git merge chore/astro-6-upgrade
git push
```

---

## Plan de rollback

Si en producción ves errores tras el merge:

```bash
git revert <merge-commit-sha>
git push
# Vercel re-deploya automáticamente la versión anterior
```

El deploy anterior se mantiene en Vercel, y puedes hacer "Promote to production" desde el dashboard sin esperar al revert si necesitas rollback inmediato.

---

## Checklist de la migración

### Fase 1 — preparación
- [ ] Branch `chore/astro-6-upgrade` creada
- [ ] Screenshots de baseline guardados
- [ ] Tamaño de bundle anotado
- [ ] Email de prueba enviado para baseline funcional

### Fase 2 — Tailwind v4
- [ ] `@astrojs/tailwind` desinstalado
- [ ] `tailwindcss@^4` y `@tailwindcss/vite@^4` instalados
- [ ] `astro.config.mjs` actualizado
- [ ] `tailwind.config.mjs` borrado
- [ ] `src/styles/tailwind.css` con `@theme` creado
- [ ] Layout importa el CSS
- [ ] Visual review pasa
- [ ] Commit "tailwind v4"

### Fase 3 — Astro 6
- [ ] `astro@^6` instalado
- [ ] `@astrojs/vercel@^10` instalado
- [ ] `npx astro check` sin errores
- [ ] `npm run build` exitoso
- [ ] Smoke test local pasa
- [ ] Commit "astro 6"

### Fase 4 — Deploy preview
- [ ] Preview URL accesible
- [ ] QA en desktop + mobile
- [ ] Lighthouse no regresa
- [ ] Form e2e funciona
- [ ] `npm audit` ya sin las 5 vulns

### Fase 5 — Merge
- [ ] Merge a `main`
- [ ] Producción verificada con un envío de form real

---

## Esfuerzo estimado

- **Fase 2 (Tailwind v4):** 1-2 horas. Es donde más probable se rompa visualmente.
- **Fase 3 (Astro 6):** 30-60 min si no aparecen breaking changes inesperados.
- **Fases 4-5 (QA + merge):** 30 min.

**Total: ~3-4 horas** de trabajo concentrado.

## Referencias

- Astro 6 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v6/
- Tailwind v3 → v4: https://tailwindcss.com/docs/upgrade-guide
- `@tailwindcss/vite`: https://tailwindcss.com/docs/installation/framework-guides/astro
- Astro `@astrojs/vercel`: https://docs.astro.build/en/guides/integrations-guide/vercel/
