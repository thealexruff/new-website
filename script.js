/**
 * Alex Ruff — scroll-driven role switcher
 *
 * The page has real scrollable height (one full-screen .scroll-seg per role).
 * All visuals live in a position:fixed .stage, so they stay pinned while the
 * page scrolls — Apple-style. Scroll position is the single source of truth:
 * an IntersectionObserver activates the role whose segment crosses the centre.
 * Using genuine scroll (rather than intercepting wheel/touch) is what lets iOS
 * Safari minimise its top/bottom chrome for the edge-to-edge look.
 */
(function () {
  const roles    = Array.from(document.querySelectorAll('.role'));
  const bgOuter  = Array.from(document.querySelectorAll('.bg-outer'));
  const bgInner  = Array.from(document.querySelectorAll('.bg-inner'));
  const subjects = Array.from(document.querySelectorAll('.subject-layer'));
  const segments = Array.from(document.querySelectorAll('.scroll-seg'));

  let current = 0;

  function activate(index) {
    if (index === current) return;

    roles[current].classList.remove('active');
    bgOuter[current]?.classList.remove('active');
    bgInner[current]?.classList.remove('active');
    subjects[current]?.classList.remove('active');

    current = index;
    roles[current].classList.add('active');
    bgOuter[current]?.classList.add('active');
    bgInner[current]?.classList.add('active');
    subjects[current]?.classList.add('active');
  }

  /* Always start at the top (role 0), even after a reload that would
     otherwise restore the previous scroll position. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* About state — declared before the observer so its callback can read it */
  let aboutOpen = false;

  /* Scroll → role. rootMargin collapses the viewport to a centre line, so
     exactly one segment "intersects" at a time: the one under screen centre. */
  const io = new IntersectionObserver((entries) => {
    if (aboutOpen) return; // don't change roles behind the About panel
    entries.forEach((e) => {
      if (e.isIntersecting) activate(Number(e.target.dataset.index));
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  segments.forEach((s) => io.observe(s));

  /* Click a role title → scroll to its segment (observer then activates it) */
  roles.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (aboutOpen) toggleAbout();
      segments[i].scrollIntoView();
    });
  });

  /* Keyboard → scroll to the neighbouring segment (clamped; no wrap) */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      segments[Math.min(current + 1, segments.length - 1)].scrollIntoView();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      segments[Math.max(current - 1, 0)].scrollIntoView();
    }
  });

  /* About toggle */
  const aboutBtn   = document.getElementById('aboutBtn');
  const aboutPanel = document.getElementById('aboutPanel');
  const rolesNav   = document.querySelector('.roles');
  const socialsEl  = document.querySelector('.socials');

  /* Lock the page scroll while About is open so roles can't change behind it */
  let lockedY = 0;
  function lockScroll() {
    lockedY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    document.documentElement.style.overflow = '';
    window.scrollTo(0, lockedY);
  }

  function toggleAbout() {
    aboutOpen = !aboutPanel.classList.contains('visible');
    if (aboutOpen) {
      lockScroll();
      aboutPanel.classList.add('visible');
      aboutPanel.setAttribute('aria-hidden', 'false');
      rolesNav.classList.add('hidden');
      aboutBtn.classList.add('active');
      aboutBtn.setAttribute('aria-expanded', 'true');
      socialsEl.classList.add('about-open');
    } else {
      aboutPanel.classList.remove('visible');
      aboutPanel.setAttribute('aria-hidden', 'true');
      rolesNav.classList.remove('hidden');
      aboutBtn.classList.remove('active');
      aboutBtn.setAttribute('aria-expanded', 'false');
      // Delay removing about-open until the font-size transition finishes (450ms)
      // so the alignment doesn't switch mid-animation (would cause a jump).
      setTimeout(() => socialsEl.classList.remove('about-open'), 450);
      unlockScroll();
    }
  }

  aboutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAbout();
  });

  /* Masthead SVG → text fallback */
  const svgEl = document.querySelector('.masthead-svg');
  const fbEl  = document.querySelector('.masthead-fallback');
  if (svgEl && fbEl) {
    svgEl.addEventListener('error', () => {
      svgEl.style.display = 'none';
      fbEl.style.display = 'block';
    });
  }
})();
