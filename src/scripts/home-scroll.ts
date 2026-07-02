const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const overlay = document.querySelector<HTMLElement>('[data-hero-overlay]');
const track = document.querySelector<HTMLElement>('[data-sheet-track]');
const sheetViewport = document.querySelector<HTMLElement>('[data-sheet-viewport]');
const panel = document.querySelector<HTMLElement>('[data-sheet-panel]');
const bodyViewport = document.querySelector<HTMLElement>('[data-sheet-body-viewport]');
const sheetBody = document.querySelector<HTMLElement>('[data-sheet-body]');

if (overlay && track && sheetViewport && panel && bodyViewport && sheetBody) {
  const sections = Array.from(sheetBody.querySelectorAll<HTMLElement>('[data-section]'));
  const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-target]'));

  let approachDistance = 0;
  let contentTravel = 0;
  let sectionOffsets: Array<{ id: string; top: number }> = [];
  let frame = 0;

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

    const scroll = clamp(window.scrollY, 0, approachDistance + contentTravel);
    const panelOffset = approachDistance - Math.min(scroll, approachDistance);
    const bodyOffset = clamp(scroll - approachDistance, 0, contentTravel);

    panel.style.transform = `translate3d(0, ${panelOffset}px, 0)`;
    sheetBody.style.transform = `translate3d(0, ${-bodyOffset}px, 0)`;

    const fadeDistance = Math.max(1, window.innerHeight * 0.3);
    const fadeProgress = clamp(scroll / fadeDistance, 0, 1);
    const heroVisibility = 1 - fadeProgress;
    overlay.style.setProperty('--hero-visibility', String(heroVisibility));
    overlay.style.setProperty('--hero-blur', `${12 * heroVisibility}px`);
    overlay.style.setProperty('--hero-white-10-alpha', String(0.1 * heroVisibility));
    overlay.style.setProperty('--hero-white-20-alpha', String(0.2 * heroVisibility));
    overlay.style.setProperty('--hero-black-40-alpha', String(0.4 * heroVisibility));
    overlay.style.setProperty('--hero-black-50-alpha', String(0.5 * heroVisibility));
    overlay.style.pointerEvents = fadeProgress > 0.95 ? 'none' : 'auto';

    const probe = bodyOffset + bodyViewport.clientHeight * 0.2;
    const active = [...sectionOffsets].reverse().find((section) => section.top <= probe);
    if (active) setActive(active.id);
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  const measure = () => {
    const panelTop = Number.parseFloat(getComputedStyle(sheetViewport).top) || 0;
    approachDistance = Math.max(0, window.innerHeight - panelTop);
    contentTravel = Math.max(0, sheetBody.scrollHeight - bodyViewport.clientHeight);
    track.style.height = `${window.innerHeight + approachDistance + contentTravel}px`;

    const bodyRect = sheetBody.getBoundingClientRect();
    sectionOffsets = sections.map((section) => ({
      id: section.dataset.section ?? '',
      top: section.getBoundingClientRect().top - bodyRect.top,
    }));

    update();
  };

  const scrollToSection = (id: string, behavior: ScrollBehavior = 'smooth') => {
    const target = sections.find((section) => section.id === id);
    if (!target) return false;

    const bodyRect = sheetBody.getBoundingClientRect();
    const targetOffset = target.getBoundingClientRect().top - bodyRect.top;
    const destination = approachDistance + clamp(targetOffset, 0, contentTravel);
    window.scrollTo({ top: destination, behavior });
    return true;
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname)
        return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (!id || !scrollToSection(id)) return;

      event.preventDefault();
      history.pushState(null, '', url.hash);
    });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('popstate', () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) {
      scrollToSection(id);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  new ResizeObserver(measure).observe(sheetBody);

  measure();

  if (window.location.hash) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    window.requestAnimationFrame(() => scrollToSection(id, 'auto'));
  }
}
