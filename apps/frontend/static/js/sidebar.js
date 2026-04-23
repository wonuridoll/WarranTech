/**
 * WarranTech — sidebar.js
 * 1. Expand / Collapse
 * 2. Nav group flyouts
 * 3. Mobile hamburger
 * 4. Light / Dark theme pill switcher
 */
(function () {
  'use strict';

  const LS_COLLAPSED = 'wt_sidebar_collapsed';
  const LS_THEME     = 'wt_theme';

  const sidebar    = document.getElementById('sidebar');
  const toggleBtn  = document.getElementById('sidebar-toggle');
  const toggleIcon = document.getElementById('toggle-icon');
  const hamburger  = document.getElementById('hamburger');
  const overlay    = document.getElementById('sidebar-overlay');
  const main       = document.getElementById('main-content');
  const html       = document.documentElement;

  /* ══════════════════════════════════════════════
     THEME SWITCHER
  ══════════════════════════════════════════════ */
  const optLight = document.getElementById('theme-opt-light');
  const optDark  = document.getElementById('theme-opt-dark');

  function applyTheme(theme, save) {
    html.setAttribute('data-theme', theme);

    // Update pill active state
    if (optLight && optDark) {
      if (theme === 'light') {
        optLight.classList.add('active');
        optDark.classList.remove('active');
      } else {
        optDark.classList.add('active');
        optLight.classList.remove('active');
      }
    }

    if (save !== false) localStorage.setItem(LS_THEME, theme);
  }

  // Boot: restore saved theme or detect OS preference
  const savedTheme = localStorage.getItem(LS_THEME)
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme, false);

  if (optLight) optLight.addEventListener('click', () => applyTheme('light'));
  if (optDark)  optDark.addEventListener('click',  () => applyTheme('dark'));

  // Also expose globally so login page can reuse
  window.wtApplyTheme = applyTheme;

  /* ══════════════════════════════════════════════
     COLLAPSE / EXPAND
  ══════════════════════════════════════════════ */
  function isCollapsed() { return sidebar.classList.contains('collapsed'); }

  function setSidebarState(collapsed, save) {
    if (collapsed) {
      sidebar.classList.add('collapsed');
      if (toggleIcon) toggleIcon.className = 'bi bi-layout-sidebar';
      if (main) main.style.marginLeft = 'var(--sb-w-collapsed)';
    } else {
      sidebar.classList.remove('collapsed');
      if (toggleIcon) toggleIcon.className = 'bi bi-layout-sidebar-reverse';
      if (main) main.style.marginLeft = 'var(--sb-w-expanded)';
    }
    positionFlyouts();
    if (save !== false) localStorage.setItem(LS_COLLAPSED, collapsed ? '1' : '0');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => setSidebarState(!isCollapsed()));

  if (localStorage.getItem(LS_COLLAPSED) === '1') {
    setSidebarState(true, false);
  }
  
  // Re-enable transitions after initial boot
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('sidebar-is-collapsed');
    });
  });

  /* ══════════════════════════════════════════════
     NAV GROUPS
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.sidebar-nav > .nav-item').forEach(item => {
    const label = item.querySelector('.nav-label');
    if (label && !item.dataset.tooltip) item.dataset.tooltip = label.textContent.trim();
  });

  const navGroups = document.querySelectorAll('.nav-group');
  navGroups.forEach(group => {
    const trigger = group.querySelector('.nav-item');
    const sub     = group.querySelector('.nav-sub');
    if (!trigger || !sub) return;

    const label = trigger.querySelector('.nav-label');
    if (label) trigger.dataset.tooltip = label.textContent.trim();

    trigger.addEventListener('click', e => {
      if (isCollapsed()) return;
      e.preventDefault();
      group.classList.toggle('open');
    });
    group.addEventListener('mouseenter', () => {
      if (!isCollapsed()) return;
      sub.style.top = trigger.getBoundingClientRect().top + 'px';
    });
  });

  function positionFlyouts() {
    navGroups.forEach(group => {
      const trigger = group.querySelector('.nav-item');
      const sub     = group.querySelector('.nav-sub');
      if (!trigger || !sub) return;
      if (isCollapsed()) sub.style.top = trigger.getBoundingClientRect().top + 'px';
      else { sub.style.top = ''; sub.style.left = ''; }
    });
  }

  /* ══════════════════════════════════════════════
     MOBILE HAMBURGER
  ══════════════════════════════════════════════ */
  function openMobile()  { sidebar.classList.add('mobile-open'); overlay.classList.add('visible'); overlay.style.display = 'block'; if (hamburger) hamburger.setAttribute('aria-expanded', 'true'); }
  function closeMobile() { sidebar.classList.remove('mobile-open'); overlay.classList.remove('visible'); overlay.style.display = 'none'; if (hamburger) hamburger.setAttribute('aria-expanded', 'false'); }

  if (hamburger) hamburger.addEventListener('click', () => sidebar.classList.contains('mobile-open') ? closeMobile() : openMobile());
  if (overlay)   overlay.addEventListener('click', closeMobile);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

})();