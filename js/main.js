/**
 * ANIMA MOTORS™ — Core Interactive Client Logic
 * Vanilla JavaScript (ES6+) — Zero external runtime dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeroVideo();
  initTelemetryClock();
  initScrollHeader();
  initMobileNavigation();
  initStatsObserver();
  initGallerySlider();
  initScrollReveal();
  initContactForm();
});

/* ==========================================================================
   1. Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  const toggleBtns = document.querySelectorAll('.theme-switch');
  const html = document.documentElement;
  
  // Default to dark theme for authentic motorsport atmosphere
  const savedTheme = localStorage.getItem('anima-theme');
  const isLightMode = savedTheme === 'light';

  function applyTheme(isLight) {
    if (isLight) {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-checked', isLight ? 'false' : 'true');
    });
  }

  applyTheme(isLightMode);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const willBeLight = !html.classList.contains('light');
      localStorage.setItem('anima-theme', willBeLight ? 'light' : 'dark');
      applyTheme(willBeLight);
    });
  });
}

/* ==========================================================================
   2. Live UTC Telemetry Clock
   ========================================================================== */
function initTelemetryClock() {
  const clockElements = document.querySelectorAll('.telemetry-clock-val');
  if (!clockElements.length) return;

  function updateClock() {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    const timeString = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;

    clockElements.forEach(el => {
      el.textContent = timeString;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   3. Navigation Scroll State
   ========================================================================== */
function initScrollHeader() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   4. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const links = drawer ? drawer.querySelectorAll('a') : [];

  if (!menuBtn || !drawer) return;

  function toggleMenu(isOpen) {
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', () => {
    const currentlyOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    toggleMenu(!currentlyOpen);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close mobile drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   4b. Hero Background Video Controller & Accessibility
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

  // Toggle video playback on click
  toggleBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  // Keep button UI in sync with native video events
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
   5. Animated Stats Counter (Triggered when scrolled into view)
   ========================================================================== */
function initStatsObserver() {
  const statsContainer = document.getElementById('specs-matrix');
  const metricValues = document.querySelectorAll('.stat-counter');
  
  if (!statsContainer || !metricValues.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If user prefers reduced motion, set final numbers immediately
  if (prefersReducedMotion) {
    metricValues.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      el.textContent = target.toFixed(decimals);
    });
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

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: ease-out quint
        const easeOut = 1 - Math.pow(1 - progress, 4);
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
   6. Touch-Friendly Multi-Angle Gallery Slider & Keyboard Support
   ========================================================================== */
function initGallerySlider() {
  const slider = document.getElementById('car-gallery-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const thumbs = document.querySelectorAll('.gallery-thumb-btn');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const perspectiveLabel = document.getElementById('gallery-perspective-label');

  const perspectives = [
    'PERSPECTIVE 01 // FRONT 3/4 WIND-TUNNEL',
    'PERSPECTIVE 02 // SIDE PROFILE HOMOLOGATION',
    'PERSPECTIVE 03 // REAR AERO DIFFUSER',
    'PERSPECTIVE 04 // TOP-DOWN PROPORTIONS'
  ];

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

    if (perspectiveLabel && perspectives[currentIndex]) {
      perspectiveLabel.textContent = perspectives[currentIndex];
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

  // Touch Swipe navigation
  let startX = 0;
  let endX = 0;

  slider.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 45; // min distance
    if (endX < startX - threshold) {
      goToSlide(currentIndex + 1); // Swipe left -> next
    } else if (endX > startX + threshold) {
      goToSlide(currentIndex - 1); // Swipe right -> prev
    }
  }

  // Keyboard navigation when user navigates using Left / Right Arrow keys
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
    }
  });
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
   8. Contact Form Handling (Configured for Formspree)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('partner-contact-form');
  const alertBox = document.getElementById('form-status-alert');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  /**
   * INSTRUCTION FOR USER:
   * To connect your free Formspree endpoint:
   * 1. Register free at https://formspree.io
   * 2. Create a new form and copy your Form ID (e.g., 'mzzbkgvw')
   * 3. Replace 'YOUR_FORMSPREE_ID' in the action URL below or in index.html!
   */
  form.addEventListener('submit', async (e) => {
    // If the action is still using placeholder, gracefully simulate or submit
    const actionUrl = form.getAttribute('action');
    
    if (actionUrl.includes('YOUR_FORMSPREE_ID')) {
      e.preventDefault();
      // Show instructional feedback modal/alert
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.borderColor = 'var(--accent-amber)';
        alertBox.style.color = 'var(--accent-amber)';
        alertBox.style.background = 'rgba(245, 158, 11, 0.1)';
        alertBox.textContent = 'Demo Mode: Message validated! To receive live submissions directly to your inbox, replace "YOUR_FORMSPREE_ID" in index.html with your free Formspree Form ID.';
      }
      form.reset();
      return;
    }

    // Live submission via Formspree API
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'TRANSMITTING TELEMETRY...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.style.borderColor = 'var(--accent-emerald)';
          alertBox.style.color = 'var(--accent-emerald)';
          alertBox.style.background = 'rgba(16, 185, 129, 0.1)';
          alertBox.textContent = 'Telemetry inquiry received. Our engineering & partnership desk will contact you shortly.';
        }
        form.reset();
      } else {
        throw new Error('Transmission failed');
      }
    } catch (err) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.borderColor = 'var(--accent-red)';
        alertBox.style.color = 'var(--accent-red)';
        alertBox.style.background = 'rgba(239, 68, 68, 0.1)';
        alertBox.textContent = 'Transmission error. Please email directly to animamotorsdrive@gmail.com.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'TRANSMIT INQUIRY';
      }
    }
  });
}
