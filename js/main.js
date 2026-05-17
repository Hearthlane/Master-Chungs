/* ============================================================
   Chung's Taekwondo & Martial Arts — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar Scroll ---------- */
  const navbar = document.querySelector('.navbar');
  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Active Nav Link ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Mobile Menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');

  const closeMobile = () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobile();
      } else {
        hamburger.classList.add('open');
        mobileMenu.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (overlay) overlay.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobile);
  });

  /* ---------- Hero Ken Burns ---------- */
  const heroBg = document.querySelector('.hero');
  if (heroBg) {
    setTimeout(() => heroBg.classList.add('loaded'), 100);
  }

  /* ---------- Scroll Animations ---------- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ---------- Counter Animation ---------- */
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current < target) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact Form ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const successMsg = document.getElementById('form-success');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        contactForm.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      }, 1200);
    });
  }

  /* ---------- Back to Top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Show/hide After School pickup fields ---------- */
  const programSelect = document.getElementById('program-interest');
  const afterSchoolFields = document.getElementById('afterschool-fields');
  if (programSelect && afterSchoolFields) {
    programSelect.addEventListener('change', () => {
      if (programSelect.value === 'After School Program') {
        afterSchoolFields.style.display = 'block';
      } else {
        afterSchoolFields.style.display = 'none';
      }
    });
  }

});
