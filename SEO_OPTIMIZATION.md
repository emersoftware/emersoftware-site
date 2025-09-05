# SEO Optimization Checklist

Lista priorizada de tareas para mejorar el SEO del sitio (Astro + Vercel).

## 1) Quick wins (alta prioridad)
- [ ] Definir `site` en `astro.config.mjs` (ej: `https://<tu-dominio>`).
- [ ] Añadir integración `@astrojs/sitemap` y construir sitemap automático.
- [ ] Crear `public/robots.txt` con referencia al sitemap (`Sitemap: https://<tu-dominio>/sitemap-index.xml`).
- [ ] Agregar `<link rel="canonical" href={Astro.url.href} />` en `src/layouts/Layout.astro`.
- [ ] Completar Open Graph/Twitter: `og:url`, `og:site_name`, `og:locale` (ej. `es_CL`), `og:image` y `twitter:image` (1200x630, en `public/og-image.jpg`).
- [ ] Añadir `meta name="theme-color"` y `meta name="author"` consistente.
- [ ] Revisar y mejorar el H1 de `src/pages/index.astro` para intención de búsqueda (ej. “Ingeniero de Software Full‑Stack | Ciudad, País”).

## 2) Metadatos por página
- [ ] Asegurar `<title>` y `<meta name="description">` únicos y descriptivos en todas las páginas.
- [ ] Añadir `meta robots` específicas si se requiere noindex en páginas utilitarias.
- [ ] Verificar `lang="es"` y considerar `content-language` si se enfoca a `es-CL`.

## 3) Datos estructurados (JSON-LD)
- [ ] `Person`: nombre, jobTitle, `sameAs` (GitHub, LinkedIn), ubicación (ciudad/país), email.
- [ ] `WebSite`: `url`, `name`, `potentialAction` (si hay búsqueda interna).
- [ ] `LocalBusiness` (opcional, si ofreces servicios locales): nombre, área, medios de contacto, horario.
- [ ] `Article`/`CreativeWork` para estudios de caso o posts.

## 4) Contenido y arquitectura
- [ ] Crear páginas/secciones de Servicios (Landing, E‑commerce, Integraciones IA/RAG/LLMs) con copy orientado a problemas/beneficios, proceso y stack.
- [ ] Crear páginas de Proyectos/Estudios de caso con problema → solución → resultados (métricas/testimonios).
- [ ] Añadir blog/notas técnicas para captar long‑tails (IA aplicada, Astro/React, RAG, embeddings, etc.).
- [ ] Mejorar enlazado interno entre Servicios, Proyectos y Contacto (CTAs claros).

## 5) Técnica y rendimiento
- [ ] Auditar Core Web Vitals (Lighthouse/Pagespeed) y registrar issues principales (LCP, CLS, INP).
- [ ] Revisar `src/scripts/stars.js`: carga diferida (`defer`/`requestIdleCallback`) y respetar `prefers-reduced-motion`.
- [ ] Evaluar `preload` o `font-display: swap` para fuentes de `@fontsource-variable/*` si mejora FOUT.
- [ ] Añadir `src/pages/404.astro` personalizada con enlaces internos.
- [ ] Optimizar imágenes (formatos modernos, tamaños correctos, `width`/`height`, `alt` descriptivo).
- [ ] Reducir JS no usado; revisar dependencias y bundle.
- [ ] Accesibilidad: `skip link`, landmarks (`header/nav/main/footer`), `aria-label` en navegación.
- [ ] (Opcional) `public/manifest.webmanifest` y `apple-touch-icon.png` para enriquecer previews en móviles.

## 6) Publicación y monitoreo
- [ ] Configurar Google Search Console y verificar dominio (DNS o meta tag).
- [ ] Enviar sitemap y verificar indexación de páginas clave.
- [ ] Configurar Analytics (GA4 o Umami) para medir tráfico y conversiones.
- [ ] Redirecciones 301 en Vercel: forzar dominio canónico (www ↔ non‑www), HTTPS y trailing slash consistente.
- [ ] Añadir headers de seguridad/caché si aplica (Vercel config).
- [ ] Revisiones trimestrales de keywords, CTR y posiciones; iterar contenido según rendimiento.

## 7) Extras SEO/SMO
- [ ] `hreflang` si agregas multilenguaje en el futuro.
- [ ] Breadcrumbs si hay jerarquía profunda.
- [ ] Favicon `.ico` como fallback además de `favicon.svg`.
- [ ] Enlazar el sitio desde perfiles (GitHub, LinkedIn) y repos para backlinks.
- [ ] Previsualizaciones sociales: comprobar tarjetas en Twitter/LinkedIn (validators) y ajustar `og:*`.

---

## Tareas específicas de código (resumen)
- [ ] `astro.config.mjs`: añadir `site` y `@astrojs/sitemap`.
- [ ] `src/layouts/Layout.astro`: canonical, `og:*`/Twitter, `theme-color` y JSON‑LD (`Person`, `WebSite`).
- [ ] `src/pages/index.astro`: H1 y descripción orientados a intención de búsqueda.
- [ ] `public/robots.txt`: permitir crawl y apuntar al sitemap.
- [ ] `public/og-image.jpg`: crear imagen social por defecto (1200×630, peso optimizado).
- [ ] `src/pages/404.astro`: página 404 con navegación útil.
- [ ] (Opcional) `public/manifest.webmanifest` y `apple-touch-icon.png`.

