/**
 * Alex Ruff — role switcher
 * Activates matching outer bg, inner bg, and subject layer together.
 */
(function () {
  const roles    = Array.from(document.querySelectorAll('.role'));
  const bgOuter  = Array.from(document.querySelectorAll('.bg-outer'));
  const bgInner  = Array.from(document.querySelectorAll('.bg-inner'));
  const subjects = Array.from(document.querySelectorAll('.subject-layer'));

  let current  = 0;
  let animating = false;
  const COOLDOWN = 650;

  function activate(index) {
    if (index === current || animating) return;
    animating = true;

    // Deactivate old
    roles[current].classList.remove('active');
    bgOuter[current]?.classList.remove('active');
    bgInner[current]?.classList.remove('active');
    subjects[current]?.classList.remove('active');

    // Activate new
    current = index;
    roles[current].classList.add('active');
    bgOuter[current]?.classList.add('active');
    bgInner[current]?.classList.add('active');
    subjects[current]?.classList.add('active');

    setTimeout(() => { animating = false; }, COOLDOWN);
  }

  function next() { closeAbout(); activate((current + 1) % roles.length); }
  function prev() { closeAbout(); activate((current - 1 + roles.length) % roles.length); }

  /* Wheel */
  let wheelAccum = 0;
  document.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) >= 60) {
      wheelAccum > 0 ? next() : prev();
      wheelAccum = 0;
    }
  }, { passive: false });

  /* Touch swipe */
  let touchY = null;
  document.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchY === null) return;
    const d = touchY - e.changedTouches[0].clientY;
    if (Math.abs(d) >= 40) { d > 0 ? next() : prev(); }
    touchY = null;
  }, { passive: true });

  /* Keyboard */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* Click on role title */
  roles.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));

  /* About toggle */
  const aboutBtn   = document.getElementById('aboutBtn');
  const aboutPanel = document.getElementById('aboutPanel');
  const rolesNav   = document.querySelector('.roles');
  const socialsEl  = document.querySelector('.socials');

  function toggleAbout() {
    const isOpen = aboutPanel.classList.contains('visible');
    if (isOpen) {
      aboutPanel.classList.remove('visible');
      aboutPanel.setAttribute('aria-hidden', 'true');
      rolesNav.classList.remove('hidden');
      aboutBtn.classList.remove('active');
      aboutBtn.setAttribute('aria-expanded', 'false');
      // Delay removing about-open until font-size transition finishes (450ms)
      // so align-items: flex-start stays in place during the scale-down,
      // preventing the jump that would happen if alignment switched mid-animation.
      setTimeout(() => socialsEl.classList.remove('about-open'), 450);
    } else {
      aboutPanel.classList.add('visible');
      aboutPanel.setAttribute('aria-hidden', 'false');
      rolesNav.classList.add('hidden');
      aboutBtn.classList.add('active');
      aboutBtn.setAttribute('aria-expanded', 'true');
      socialsEl.classList.add('about-open');
    }
  }

  aboutBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't trigger role switcher
    toggleAbout();
  });

  /* Close about on scroll/swipe too */
  function closeAbout() {
    if (aboutPanel.classList.contains('visible')) toggleAbout();
  }
  const svgEl = document.querySelector('.masthead-svg');
  const fbEl  = document.querySelector('.masthead-fallback');
  if (svgEl && fbEl) {
    svgEl.addEventListener('error', () => {
      svgEl.style.display = 'none';
      fbEl.style.display = 'block';
    });
  }
})();
