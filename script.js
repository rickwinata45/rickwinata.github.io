/* =========================================================
   RICKY WINATA — PORTFOLIO
   script.js

   Daftar isi:
   1. Helper & konfigurasi
   2. Mobile nav toggle
   3. Smooth scroll untuk semua tautan #anchor
   4. Highlight nav aktif saat scroll (IntersectionObserver)
   5. Reveal on scroll (IntersectionObserver)
   6. Typing effect hero (nama + role berulang)
   7. Tilt 3D + glow pada foto profil
   8. Navbar berubah saat discroll
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Helper ---------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* ---------- 2. Mobile nav toggle ---------- */
  const navToggle = $('#navToggle');
  const navLinksEl = $('#navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('is-active', isOpen);
  });

  /* Tutup menu mobile setiap kali sebuah link diklik */
  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 3. Smooth scroll ---------- */
  // CSS "scroll-margin-top" pada section sudah menangani offset navbar,
  // di sini kita hanya perlu memicu scrollIntoView yang mulus.
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      // Perbarui URL tanpa memicu jump tambahan
      history.pushState(null, '', targetId);
    });
  });

  /* ---------- 4. Highlight nav aktif saat scroll ---------- */
  const sections = $$('main section[id]');
  const navLinkMap = new Map(
    $$('.nav-link').map((link) => [link.dataset.section, link])
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkMap.get(entry.target.id);
        if (!link) return;

        if (entry.isIntersecting) {
          $$('.nav-link').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ---------- 5. Reveal on scroll ---------- */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger halus antar elemen dalam grup yang sama
          const delay = prefersReducedMotion ? 0 : index * 60;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 6. Typing effect hero ---------- */
  const typedNameEl = $('#typedName');
  const typedRoleEl = $('#typedRole');

  const NAME = 'Ricky Winata';
  const ROLES = [
    'Web Developer',
    'Python Enthusiast',
    'Linux Explorer',
    'IT Support',
    'Prompt Engginer',
  ];

  function typeText(el, text, speed = 90) {
    return new Promise((resolve) => {
      if (prefersReducedMotion) {
        el.textContent = text;
        resolve();
        return;
      }
      let i = 0;
      (function step() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function eraseText(el, speed = 45) {
    return new Promise((resolve) => {
      if (prefersReducedMotion) {
        el.textContent = '';
        resolve();
        return;
      }
      let text = el.textContent;
      (function step() {
        if (text.length > 0) {
          text = text.slice(0, -1);
          el.textContent = text;
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  async function loopRoles() {
    if (prefersReducedMotion) {
      typedRoleEl.textContent = ROLES[0];
      return;
    }
    let index = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await typeText(typedRoleEl, ROLES[index], 70);
      await new Promise((r) => setTimeout(r, 1400));
      await eraseText(typedRoleEl, 35);
      await new Promise((r) => setTimeout(r, 300));
      index = (index + 1) % ROLES.length;
    }
  }

  (async function startHeroTyping() {
    await typeText(typedNameEl, NAME, 110);
    loopRoles();
  })();

  /* ---------- 7. Tilt 3D + glow pada foto profil ---------- */
  const photoFrame = $('#photoFrame');

  if (photoFrame && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const MAX_TILT = 10; // derajat

    photoFrame.addEventListener('mousemove', (e) => {
      const rect = photoFrame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * MAX_TILT * 2;
      const rotateX = -y * MAX_TILT * 2;

      photoFrame.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    photoFrame.addEventListener('mouseleave', () => {
      photoFrame.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  /* ---------- 8. Navbar berubah saat discroll ---------- */
  const navbar = $('#navbar');
  let lastScrollState = false;

  function updateNavbarOnScroll() {
    const shouldShrink = window.scrollY > 40;
    if (shouldShrink !== lastScrollState) {
      navbar.style.background = shouldShrink
        ? 'rgba(10, 14, 22, 0.92)'
        : 'rgba(10, 14, 22, 0.75)';
      lastScrollState = shouldShrink;
    }
  }

  window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });
  updateNavbarOnScroll();
});