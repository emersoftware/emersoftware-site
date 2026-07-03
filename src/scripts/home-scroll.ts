// El scroll de la hoja es 100% nativo: este script NO traslada contenido.
// Solo maneja tres cosas acotadas:
//   1. el desvanecimiento del hero (una custom property de opacidad),
//   2. el estado "dockeado" (activa la franja peek sobre el nav sticky),
//   3. la sección activa del nav (IntersectionObserver, sin trabajo por frame).

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const overlay = document.querySelector<HTMLElement>('[data-hero-overlay]');
const sheet = document.querySelector<HTMLElement>('[data-sheet]');
const sectionNav = document.querySelector<HTMLElement>('[data-section-nav]');

if (overlay && sheet) {
  const root = document.documentElement;
  const sections = Array.from(sheet.querySelectorAll<HTMLElement>('[data-section]'));
  const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-target]'));

  let fadeDistance = 1;
  let dockPoint = Number.POSITIVE_INFINITY;
  let frame = 0;
  let lastVisibility = -1;
  let lastFaded = false;
  let lastDocked = false;

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
      overlay.style.setProperty('--hero-visibility', String(visibility));
    }

    // visibility libera las capas de backdrop-filter cuando el hero no se ve.
    const faded = progress >= 1;
    if (faded !== lastFaded) {
      lastFaded = faded;
      overlay.style.visibility = faded ? 'hidden' : '';
    }

    // Dockeada la hoja, la franja peek tapa el contenido que sube sobre el nav.
    const docked = y >= dockPoint;
    if (docked !== lastDocked) {
      lastDocked = docked;
      if (docked) root.setAttribute('data-docked', '');
      else root.removeAttribute('data-docked');
    }
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  const measure = () => {
    fadeDistance = Math.max(1, root.clientHeight * 0.3);
    const sheetTop = sectionNav ? Number.parseFloat(getComputedStyle(sectionNav).top) || 0 : 0;
    // offsetTop de la hoja = alto del espaciador (100lvh, constante en iOS).
    dockPoint = Math.max(0, sheet.offsetTop - sheetTop - 1);
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
  // Sin trabajo de layout dentro del handler de scroll: re-medir solo en resize
  // es barato (dos lecturas) y ya no hay geometría JS que pueda saltar.
  window.addEventListener('resize', measure, { passive: true });

  measure();
}
