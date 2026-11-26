/* =====================================================================
   Portafolio — Gerson Othoniel Espinoza Huaman
   JavaScript vanilla (sin dependencias):
   - Modo claro / oscuro accesible
   - Persistencia en localStorage
   - Respeta prefers-color-scheme del sistema
   - Navegación móvil · animaciones suaves · formulario de contacto
   ===================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- Tema claro / oscuro ---------- */
  const STORAGE_KEY = 'gerson-portfolio-theme'; // 'light' | 'dark'
  const THEME_COLORS = { light: '#ffffff', dark: '#0f1216' };

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const themeToggle = document.getElementById('theme-toggle');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  /** Lee la preferencia guardada, tolerando localStorage no disponible. */
  function readStoredTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (err) {
      return null; // p. ej. modo privado o storage bloqueado
    }
  }

  /** Tema del sistema operativo / navegador. */
  function systemTheme() {
    return prefersDark.matches ? 'dark' : 'light';
  }

  /** Preferencia explícita del usuario tiene prioridad; si no, el sistema. */
  function activeTheme() {
    return readStoredTheme() || systemTheme();
  }

  /** Aplica el tema, actualiza el interruptor accesible y la meta de color. */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);

    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
    }
  }

  // Inicializa al cargar
  applyTheme(activeTheme());

  // Interruptor manual + persistencia en localStorage
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (err) { /* no bloquear si no se puede guardar */ }
      applyTheme(next);
    });
  }

  // Si el usuario no eligió manualmente, sigue los cambios del sistema
  const onSystemThemeChange = () => {
    if (!readStoredTheme()) applyTheme(systemTheme());
  };
  if (typeof prefersDark.addEventListener === 'function') {
    prefersDark.addEventListener('change', onSystemThemeChange);
  } else if (typeof prefersDark.addListener === 'function') {
    prefersDark.addListener(onSystemThemeChange); // navegadores antiguos
  }

  /* ---------- Fotografía: fallback si ./foto.jpg no existe ---------- */
  const heroImg = document.querySelector('.hero-photo__img');
  if (heroImg) {
    heroImg.addEventListener('error', () => { heroImg.style.display = 'none'; });
  }

  /* ---------- Navegación móvil ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');

  if (navToggle && navList) {
    const setNavOpen = (open) => {
      navList.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    };

    navToggle.addEventListener('click', () => setNavOpen(!navList.classList.contains('is-open')));
    navList.addEventListener('click', (event) => {
      if (event.target.closest('a')) setNavOpen(false); // cerrar tras elegir
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    });
  }

  /* ---------- Animaciones suaves al aparecer ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach((el) => observer.observe(el));
    }
  }

  /* ---------- Formulario de contacto (sin backend) ---------- */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity(); // mensajes nativos accesibles
        if (formStatus) formStatus.textContent = 'Revisa los campos obligatorios.';
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const subject = String(data.get('subject') || '').trim() || `Contacto de ${name}`;
      const message = String(data.get('message') || '').trim();
      const to = (form.getAttribute('data-contact-email') || '').trim();
      const body = `Nombre: ${name}\nCorreo: ${email}\n\n${message}`;

      const mailto = `mailto:${to}`
        + `?subject=${encodeURIComponent(subject)}`
        + `&body=${encodeURIComponent(body)}`;

      if (formStatus) formStatus.textContent = 'Abriendo tu cliente de correo…';
      window.location.href = mailto;
    });
  }

  /* ---------- Año actual en el pie ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
