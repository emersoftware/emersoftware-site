// El scroll de la hoja es 100% nativo: este script NO traslada contenido.
// Solo maneja dos cosas acotadas:
//   1. el desvanecimiento del hero (una custom property de opacidad),
//   2. la sección activa del nav (IntersectionObserver, sin trabajo por frame).
// La máscara superior es permanente: ningún estado visual del papel depende
// de que JavaScript alcance al scroll asíncrono del navegador.

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const overlay = document.querySelector<HTMLElement>('[data-hero-overlay]');
const heroNavbar = document.querySelector<HTMLElement>('[data-hero-navbar]');
const sheet = document.querySelector<HTMLElement>('[data-sheet]');

if (overlay && sheet) {
  const root = document.documentElement;
  const heroLayers = heroNavbar ? [overlay, heroNavbar] : [overlay];
  const sections = Array.from(sheet.querySelectorAll<HTMLElement>('[data-section]'));
  const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-target]'));

  let fadeDistance = 1;
  let frame = 0;
  let lastVisibility = -1;
  let lastFaded = false;
  let lastViewportWidth = root.clientWidth;

  // Limpia el atributo usado por la implementación anterior. Ya no controla
  // ninguna capa visual ni participa en el scroll.
  root.removeAttribute('data-docked');

  const setActive = (id: string) => {
    navLinks.forEach((link) => {
      link.setAttribute(
        'data-active',
        link.getAttribute('data-nav-target') === id ? 'true' : 'false'
      );
    });
  };

  const update = () => {
    frame = 0;
    const y = window.scrollY;

    // Solo se anima la opacidad (composición en GPU); el blur queda estático.
    const progress = clamp(y / fadeDistance, 0, 1);
    const visibility = Math.round((1 - progress) * 1000) / 1000;
    if (visibility !== lastVisibility) {
      lastVisibility = visibility;
      heroLayers.forEach((layer) =>
        layer.style.setProperty('--hero-visibility', String(visibility))
      );
    }

    // visibility libera las capas de backdrop-filter cuando el hero no se ve.
    const faded = progress >= 1;
    if (faded !== lastFaded) {
      lastFaded = faded;
      heroLayers.forEach((layer) => (layer.style.visibility = faded ? 'hidden' : ''));
    }
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  const measure = () => {
    fadeDistance = Math.max(1, root.clientHeight * 0.3);
    update();
  };

  // Sección activa sin tocar el hilo por frame: una banda en el 15%–35% del
  // viewport decide qué sección manda. Si más de una intersecta (secciones
  // cortas), gana la primera en orden de documento: la que está en la posición
  // de lectura.
  const intersecting = new Set<HTMLElement>();
  const activeObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target as HTMLElement);
        else intersecting.delete(entry.target as HTMLElement);
      }
      const current = sections.find((section) => intersecting.has(section));
      if (current?.dataset.section) setActive(current.dataset.section);
    },
    { rootMargin: '-15% 0px -65% 0px' }
  );
  sections.forEach((section) => activeObserver.observe(section));
  if (sections[0]?.dataset.section) setActive(sections[0].dataset.section);

  window.addEventListener('scroll', requestUpdate, { passive: true });
  // Safari dispara resize mientras expande/colapsa sus barras. La geometría de
  // la hoja usa lvh y no cambia en esos eventos de sólo altura; medir ahí puede
  // forzar un frame tardío justo al terminar el gesto. Re-medimos únicamente
  // cuando cambia el ancho (breakpoint u orientación).
  window.addEventListener(
    'resize',
    () => {
      const width = root.clientWidth;
      if (width === lastViewportWidth) return;
      lastViewportWidth = width;
      measure();
    },
    { passive: true }
  );

  measure();
}
