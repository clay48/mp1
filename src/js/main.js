/* EarForge single-page site: navbar, smooth scroll, carousel, modals, reveals. */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------
 * Navbar: resize on scroll + position indicator
 * -------------------------------------------------------- */
const nav = document.getElementById('nav');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
const navLinks = Array.from(nav.querySelectorAll('[data-nav-link]'));
const sections = Array.from(document.querySelectorAll('[data-section]'));
const COMPACT_AFTER = 40; // px scrolled before the navbar shrinks

function updateNavSize() {
  nav.classList.toggle('is-compact', window.scrollY > COMPACT_AFTER);
}

// Highlight the menu item whose section sits directly below the navbar's bottom edge.
function updateActiveLink() {
  const navBottom = nav.getBoundingClientRect().bottom;
  const atPageBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  let current = sections[0];
  if (atPageBottom) {
    current = sections[sections.length - 1];
  } else {
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= navBottom + 1) {
        current = section;
      }
    });
  }

  const id = `#${current.id}`;
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === id);
  });
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateNavSize();
    updateActiveLink();
    ticking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

// Mobile menu toggle (below 600px)
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ----------------------------------------------------------
 * Smooth scrolling
 * -------------------------------------------------------- */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    return;
  }
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}

function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const compactHeight = 60; // matches $nav-short; nav is always compact below the hero
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const top = hash === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - compactHeight;
  const destination = Math.max(0, Math.min(top, maxY));
  const duration = Math.min(1200, Math.max(450, Math.abs(destination - window.scrollY) * 0.4));
  smoothScrollTo(destination, duration);
  history.replaceState(null, '', hash);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    event.preventDefault();
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    scrollToSection(hash);
  });
});

/* ----------------------------------------------------------
 * Carousel
 * -------------------------------------------------------- */
function initCarousel(root) {
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dotsWrap = root.querySelector('.carousel__dots');
  let index = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render(prev, direction) {
    slides.forEach((slide, i) => {
      slide.classList.remove('is-leaving-left', 'is-leaving-right', 'is-entering-left');
      slide.setAttribute('aria-hidden', String(i !== index));
    });

    if (prev !== undefined && prev !== index) {
      const incoming = slides[index];
      const outgoing = slides[prev];
      // Going backwards: start the incoming slide on the left side.
      if (direction < 0) {
        incoming.classList.add('is-entering-left');
        void incoming.offsetWidth; // force reflow so the start position applies
        incoming.classList.remove('is-entering-left');
      }
      outgoing.classList.remove('is-active');
      outgoing.classList.add(direction > 0 ? 'is-leaving-left' : 'is-leaving-right');
    }
    slides[index].classList.add('is-active');
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function goTo(next, direction) {
    const prev = index;
    index = (next + slides.length) % slides.length;
    const dir = direction !== undefined ? direction : Math.sign(next - prev);
    render(prev, dir);
  }

  root.querySelector('[data-carousel-prev]').addEventListener('click', () => goTo(index - 1, -1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => goTo(index + 1, 1));

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goTo(index - 1, -1);
    if (event.key === 'ArrowRight') goTo(index + 1, 1);
  });

  // Touch swipe
  let touchStartX = null;
  root.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchStartX = null;
  });

  render();
}

initCarousel(document.getElementById('carousel'));

/* ----------------------------------------------------------
 * Modals (native <dialog>)
 * -------------------------------------------------------- */
function openModal(dialog) {
  dialog.showModal();
  document.body.classList.add('is-locked');
}

function closeModal(dialog) {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  const finish = () => {
    dialog.classList.remove('is-closing');
    dialog.close();
  };
  if (prefersReducedMotion) finish();
  else dialog.addEventListener('animationend', finish, { once: true });
}

document.querySelectorAll('[data-modal-open]').forEach((button) => {
  const dialog = document.getElementById(button.dataset.modalOpen);
  button.addEventListener('click', () => openModal(dialog));
});

document.querySelectorAll('dialog.modal').forEach((dialog) => {
  dialog.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', () => closeModal(dialog));
  });
  // Click on the backdrop (outside the dialog box) closes it.
  dialog.addEventListener('click', (event) => {
    const r = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= r.left && event.clientX <= r.right &&
      event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) closeModal(dialog);
  });
  // Escape key: animate out instead of the instant native close.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModal(dialog);
  });
  dialog.addEventListener('close', () => document.body.classList.remove('is-locked'));
});

/* ----------------------------------------------------------
 * Scroll-reveal animations
 * -------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

updateNavSize();
updateActiveLink();
