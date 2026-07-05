/* ============================================================
   Chung's Taekwondo — "Dojang Bright" Interactions
   Preloader · Cinematic hero · Scroll reveals · GSAP flourishes
   ============================================================ */

/* Mark JS availability ASAP so reveal styles only apply when JS runs */
document.documentElement.classList.add('has-js');

/* ------------------------------------------------------------
   PRELOADER — full belt-rank animation on first load of the
   session; quick fade on subsequent page views.
   ------------------------------------------------------------ */
(function () {
  var FIRST_VISIT_KEY = 'chungs-preloaded';
  var isFirstVisit = false;

  try {
    isFirstVisit = !sessionStorage.getItem(FIRST_VISIT_KEY);
    sessionStorage.setItem(FIRST_VISIT_KEY, '1');
  } catch (e) { /* storage blocked — treat as repeat visit */ }

  if (!isFirstVisit) {
    document.body.classList.add('page-enter');
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.body.classList.add('is-loading');

  var preloader = document.createElement('div');
  preloader.id = 'preloader';
  preloader.setAttribute('aria-hidden', 'true');
  preloader.innerHTML =
    '<div class="preloader-curtain curtain-left"></div>' +
    '<div class="preloader-curtain curtain-right"></div>' +
    '<div class="preloader-inner">' +
      '<div class="preloader-emblem">' +
        '<svg viewBox="0 0 150 150">' +
          '<defs><linearGradient id="preloaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#ce2036"/><stop offset="100%" stop-color="#0b3f8f"/>' +
          '</linearGradient></defs>' +
          '<circle class="ring-track" cx="75" cy="75" r="70"/>' +
          '<circle class="ring-fill" cx="75" cy="75" r="70"/>' +
        '</svg>' +
        '<img src="images/logo.png" alt="" />' +
      '</div>' +
      '<div class="preloader-title">Chung’s <em>Taekwondo</em></div>' +
      '<div class="preloader-belt"><div class="preloader-belt-fill"></div></div>' +
      '<div class="preloader-sub">Train the mind, body and spirit</div>' +
    '</div>';
  document.body.appendChild(preloader);

  var finished = false;
  var finish = function () {
    if (finished) return;
    finished = true;
    preloader.classList.add('exit');
    document.body.classList.remove('is-loading');
    document.dispatchEvent(new CustomEvent('preloader:done'));
    setTimeout(function () {
      if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 1000);
  };

  /* Wait for belt animation (~2.1s) AND window load, capped at 3.6s */
  var minTime = new Promise(function (r) { setTimeout(r, 2150); });
  var loaded = new Promise(function (r) {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
  });
  Promise.all([minTime, loaded]).then(finish);
  setTimeout(finish, 3600);
})();

document.addEventListener('DOMContentLoaded', function () {

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.querySelector('.navbar');
  var onNavScroll = function () {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- Active nav link (matches both /camp and /camp.html) ---------- */
  var norm = function (s) { return (s || '').split('?')[0].split('#')[0].replace(/\.html$/, '') || 'index'; };
  var currentPage = norm(window.location.pathname.split('/').pop());
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
    if (norm(link.getAttribute('href')) === currentPage) link.classList.add('active');
  });

  /* ---------- Mobile menu ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  var closeMobile = function () {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (hamburger && mobileMenu) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobile();
        hamburger.setAttribute('aria-expanded', 'false');
      } else {
        hamburger.classList.add('open');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobile);
    });
  }

  /* ------------------------------------------------------------
     HERO CINEMA — Ken Burns crossfade slideshow ("video" hero)
     ------------------------------------------------------------ */
  (function () {
    var cinema = document.querySelector('.hero-cinema');
    var hero = document.querySelector('.hero');
    if (!cinema || !hero) return;

    var slides = Array.prototype.slice.call(cinema.querySelectorAll('.cinema-slide'));
    var dotsWrap = document.querySelector('.hero-dots');
    var current = 0;
    var timer = null;
    var DURATION = 5000;
    var kbClasses = ['kb-a', 'kb-b', 'kb-c', 'kb-d'];

    /* First slide paints immediately; the rest load after the page is
       idle so they don't compete with above-the-fold content on mobile */
    var loadSlide = function (slide) {
      var src = slide.getAttribute('data-src');
      if (src && !slide.style.backgroundImage) {
        var img = new Image();
        img.src = src;
        slide.style.backgroundImage = 'url("' + src + '")';
      }
    };
    loadSlide(slides[0]);
    var loadRest = function () {
      setTimeout(function () { slides.forEach(loadSlide); }, 1200);
    };
    if (document.readyState === 'complete') loadRest();
    else window.addEventListener('load', loadRest, { once: true });

    var dots = [];
    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, i) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Show slide ' + (i + 1));
        b.addEventListener('click', function () { go(i, true); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function apply(i) {
      slides.forEach(function (s, j) {
        s.classList.toggle('active', j === i);
        if (j === i) {
          /* restart the Ken Burns move each time the slide shows */
          kbClasses.forEach(function (k) { s.classList.remove(k); });
          void s.offsetWidth; /* reflow so the animation restarts */
          s.classList.add(kbClasses[i % kbClasses.length]);
        }
      });
      dots.forEach(function (d, j) {
        d.classList.remove('active');
        if (j === i) { void d.offsetWidth; d.classList.add('active'); }
      });
    }

    function next() { go((current + 1) % slides.length, false); }

    function go(i, manual) {
      current = i;
      apply(i);
      if (timer) clearTimeout(timer);
      if (slides.length > 1 && !reduceMotion) timer = setTimeout(next, manual ? DURATION : DURATION);
    }

    /* Pause the show while the tab is hidden */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
      } else {
        go(current, false);
      }
    });

    go(0, false);

    /* Intro reveal — wait for the preloader curtains so the headline
       animation is actually seen on first visit */
    var playIntro = function () {
      setTimeout(function () { hero.classList.add('hero-in'); }, 250);
    };
    if (document.body.classList.contains('is-loading')) {
      document.addEventListener('preloader:done', playIntro, { once: true });
    } else {
      setTimeout(playIntro, 100);
    }
  })();

  /* Interior page heroes get a simple in-class too */
  var pageHero = document.querySelector('.page-hero');
  if (pageHero) pageHero.classList.add('hero-in');

  /* ------------------------------------------------------------
     SCROLL REVEALS — IntersectionObserver core (GSAP-free path)
     ------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ---------- Animated counters ---------- */
  var animateCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var start = null;

    var tick = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var html = Math.round(target * eased) + '<span class="suffix">' + suffix + '</span>';
      el.innerHTML = html;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  var counters = document.querySelectorAll('[data-target]');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ------------------------------------------------------------
     GSAP FLOURISHES (progressive enhancement — safe if CDN fails)
     ------------------------------------------------------------ */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* Parallax drift on marked images (slight over-scale hides the drift gaps) */
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-parallax')) || 40;
      gsap.fromTo(el,
        { y: -strength, scale: 1.12 },
        {
          y: strength,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
        });
    });

    /* Hero content drifts up slightly as you scroll away */
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        y: -70,
        opacity: 0.35,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* Marquee gets a subtle scroll-linked speed-up via skew feel */
    var marquee = document.querySelector('.marquee-track');
    if (marquee) {
      gsap.to('.marquee', {
        xPercent: -3,
        ease: 'none',
        scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    }

    /* Belt progression pops in one belt at a time (small offset so the
       waiting cards never sit over the note text below) */
    var beltSteps = document.querySelectorAll('.belt-step');
    if (beltSteps.length) {
      gsap.from(beltSteps, {
        y: 20,
        opacity: 0,
        scale: 0.95,
        stagger: 0.09,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.belt-progression', start: 'top 90%' }
      });
    }
  }

  /* ---------- Review slider: duplicate the track so it loops forever ---------- */
  var reviewTrack = document.querySelector('.review-track');
  if (reviewTrack && !reviewTrack.dataset.looped) {
    reviewTrack.innerHTML += reviewTrack.innerHTML;
    reviewTrack.dataset.looped = '1';
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var galleryItems = document.querySelectorAll('.gallery-item');
  var currentIndex = 0;

  var openLightbox = function (index) {
    currentIndex = index;
    lightboxImg.src = galleryItems[index].getAttribute('data-src');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  var closeLightbox = function () {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (lightbox && galleryItems.length) {
    galleryItems.forEach(function (item, i) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Open photo ' + (i + 1) + ' in lightbox');
      item.addEventListener('click', function () { openLightbox(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      lightboxImg.src = galleryItems[currentIndex].getAttribute('data-src');
    });
    if (lightboxNext) lightboxNext.addEventListener('click', function (e) {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % galleryItems.length;
      lightboxImg.src = galleryItems[currentIndex].getAttribute('data-src');
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
      if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    });
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-header').forEach(function (header) {
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    var toggle = function () {
      var item = header.closest('.accordion-item');
      var body = item.querySelector('.accordion-body');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = null;
        openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var successMsg = document.getElementById('form-success');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      setTimeout(function () {
        contactForm.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      }, 1200);
    });
  }

  /* ---------- After-school conditional fields ---------- */
  var programSelect = document.getElementById('program-interest');
  var afterSchoolFields = document.getElementById('afterschool-fields');
  if (programSelect && afterSchoolFields) {
    programSelect.addEventListener('change', function () {
      afterSchoolFields.style.display =
        programSelect.value === 'After School Program' ? 'block' : 'none';
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 420);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
