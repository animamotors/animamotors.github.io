/**
 * ANIMA MOTORS™ — Core Interactive Client Logic
 * Vanilla JavaScript (ES6+) — Zero external runtime dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  const inits = [
    ['Theme', initTheme],
    ['Hero Video', initHeroVideo],
    ['Scroll Header', initScrollHeader],
    ['Mobile Navigation', initMobileNavigation],
    ['Stats Observer', initStatsObserver],
    ['Gallery Slider', initGallerySlider],
    ['Scroll Reveal', initScrollReveal],
    ['Contact Form', initContactForm]
  ];

  inits.forEach(([name, fn]) => {
    try {
      fn();
    } catch (err) {
      console.warn(`Init skipped or failed for ${name}:`, err);
    }
  });
});

/* ==========================================================================
   1. Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  const html = document.documentElement;
  const toggleBtns = [
    document.getElementById('theme-toggle'),
    document.getElementById('theme-toggle-mobile')
  ].filter(Boolean);
  const themeColorMeta = document.getElementById('theme-color-meta');

  function updateButtons(isLight) {
    const label = isLight ? 'Switch to dark theme' : 'Switch to light theme';
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', label);
    });
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isLight ? '#f7f7f9' : '#070709');
    }
  }

  // Sync initial state
  const isLight = html.classList.contains('light');
  updateButtons(isLight);

  function toggle() {
    html.classList.add('theme-transitioning');

    const willBeLight = !html.classList.contains('light');
    if (willBeLight) {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }

    try {
      localStorage.setItem('anima-theme', willBeLight ? 'light' : 'dark');
    } catch (e) {
      // localStorage may be disabled in private/sandboxed browsing
    }

    updateButtons(willBeLight);

    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 280);
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', toggle);
  });
}

/* ==========================================================================
   2. Navigation Header (BMW Group Collapse Behavior)
   ========================================================================== */
function initScrollHeader() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  if (navbar.classList.contains('navbar--solid') || navbar.hasAttribute('data-compact-always')) {
    navbar.classList.add('is-compact');
    return;
  }

  let ticking = false;

  function updateHeader() {
    const y = window.scrollY || window.pageYOffset || 0;
    const isCurrentlyCompact = navbar.classList.contains('is-compact');

    // Hysteresis: collapse at 80px, expand back when below 20px
    if (!isCurrentlyCompact && y > 80) {
      navbar.classList.add('is-compact');
    } else if (isCurrentlyCompact && y < 20) {
      navbar.classList.remove('is-compact');
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Call once on load so reloads and #hash links start in the correct state
  updateHeader();
}

/* ==========================================================================
   3. Mobile Navigation Drawer & Focus Trap
   ========================================================================== */
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (!menuBtn || !drawer) return;

  const links = drawer.querySelectorAll('a, button');
  let previouslyFocusedElement = null;

  function setDrawerOpen(isOpen) {
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');

    if (isOpen) {
      previouslyFocusedElement = document.activeElement;
      drawer.classList.add('open');
      drawer.removeAttribute('inert');
      document.body.style.overflow = 'hidden';

      // Move focus inside drawer
      const firstFocusable = drawer.querySelector('a, button');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    } else {
      drawer.classList.remove('open');
      drawer.setAttribute('inert', '');
      document.body.style.overflow = '';

      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    }
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    setDrawerOpen(!isOpen);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      setDrawerOpen(false);
    });
  });

  // Focus trap inside open drawer
  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;

    if (e.key === 'Escape') {
      setDrawerOpen(false);
      return;
    }

    if (e.key === 'Tab') {
      const focusables = Array.from(drawer.querySelectorAll('a, button:not([disabled])'));
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  // Automatically close drawer if window expands past 1024px
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && drawer.classList.contains('open')) {
      setDrawerOpen(false);
    }
  }, { passive: true });
}

/* ==========================================================================
   4. Hero Background Video Controller
   ========================================================================== */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const toggleBtn = document.getElementById('hero-video-toggle');
  if (!video || !toggleBtn) return;

  function updateVideoUI(isPaused) {
    if (isPaused) {
      toggleBtn.classList.add('is-paused');
      toggleBtn.setAttribute('aria-label', 'Play background video');
      toggleBtn.setAttribute('title', 'Play background video');
    } else {
      toggleBtn.classList.remove('is-paused');
      toggleBtn.setAttribute('aria-label', 'Pause background video');
      toggleBtn.setAttribute('title', 'Pause background video');
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', () => updateVideoUI(false));
  video.addEventListener('pause', () => updateVideoUI(true));

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    video.pause();
    updateVideoUI(true);
  }
  prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      video.pause();
      updateVideoUI(true);
    }
  });

  // Data-saver / slow mobile connection fallback
  if (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) {
    video.pause();
    updateVideoUI(true);
  }
}

/* ==========================================================================
   5. Animated Stats Counter
   ========================================================================== */
function initStatsObserver() {
  const statsContainer = document.getElementById('specs-matrix');
  const metricValues = document.querySelectorAll('.stat-counter');
  if (!statsContainer || !metricValues.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Keep final values in HTML
    return;
  }

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateAllCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(statsContainer);

  function animateAllCounters() {
    metricValues.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const duration = 1200; // milliseconds
      const startTime = performance.now();

      // Reset to 0 before animating
      el.textContent = (0).toFixed(decimals);

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: ease-out quint
        const easeOut = 1 - Math.pow(1 - progress, 5);
        const current = target * easeOut;
        
        el.textContent = current.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      }

      requestAnimationFrame(update);
    });
  }
}

/* ==========================================================================
   6. Multi-Angle Gallery Slider
   ========================================================================== */
function initGallerySlider() {
  const slider = document.getElementById('car-gallery-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const thumbs = document.querySelectorAll('.gallery-thumb-btn');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const counterEl = document.getElementById('gallery-counter');

  let currentIndex = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    thumbs.forEach((thumb, i) => {
      if (i === currentIndex) {
        thumb.classList.add('active');
        thumb.setAttribute('aria-selected', 'true');
      } else {
        thumb.classList.remove('active');
        thumb.setAttribute('aria-selected', 'false');
      }
    });

    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }
  }

  // Thumbnails click
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const targetIndex = parseInt(thumb.getAttribute('data-index') || '0', 10);
      goToSlide(targetIndex);
    });
  });

  // Prev / Next button navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // Keyboard navigation when slider is focused
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
    }
  });

  // Touch Swipe navigation (ignores gestures where vertical movement > horizontal)
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  slider.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe();
    }
  }, { passive: true });

  function handleSwipe() {
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Ignore gestures where vertical movement is larger than horizontal
    if (Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    const threshold = 45; // min horizontal distance
    if (diffX < -threshold) {
      goToSlide(currentIndex + 1); // Swipe left -> next
    } else if (diffX > threshold) {
      goToSlide(currentIndex - 1); // Swipe right -> prev
    }
  }
}

/* ==========================================================================
   7. Scroll Reveal Motion
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   8. Contact Form Handling
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('partner-contact-form');
  const alertBox = document.getElementById('form-status-alert');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) {
        btnText.textContent = 'Sending...';
      }
    }

    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.className = 'form-status-alert';
    }

    try {
      const formData = new FormData(form);
      const actionUrl = form.getAttribute('action') || 'https://formspree.io/f/xnpjwydl';

      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        if (alertBox) {
          alertBox.className = 'form-status-alert form-status-success';
          alertBox.textContent = 'Thank you. We will reply soon.';
          alertBox.style.display = 'block';
        }
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'form-status-alert form-status-error';
        alertBox.textContent = 'Something went wrong. Please email animamotorsdrive@gmail.com.';
        alertBox.style.display = 'block';
      }
      // Note: do not clear the visitor's message or form input on error
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) {
          btnText.textContent = 'Send message';
        }
      }
    }
  });
}
