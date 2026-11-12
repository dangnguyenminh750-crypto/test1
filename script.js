/**
 * Nguyễn Minh Đăng — Personal Portfolio Script
 * Ultra-resilient, safe execution for both file:// and http:// protocols
 */

(function () {
  'use strict';

  // Helper for safe storage (handles file:/// access restrictions)
  const safeStorage = {
    get: function (key, fallback) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = window.localStorage.getItem(key);
          return item !== null ? item : fallback;
        }
      } catch (err) {
        // Storage is blocked or restricted (e.g. file:// protocol)
      }
      return fallback;
    },
    set: function (key, value) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (err) {
        // Storage is blocked or restricted
      }
    }
  };

  function initPortfolio() {
    const htmlRoot = document.documentElement;

    // 1. Theme Initialization & Toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = safeStorage.get('portfolio-theme', 'dark');
    htmlRoot.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlRoot.setAttribute('data-theme', newTheme);
        safeStorage.set('portfolio-theme', newTheme);
      });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
      });

      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          navMenu.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', function (e) {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 3. Scroll Progress & Header Blur
    const progressBar = document.getElementById('scrollProgress');
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id], main[id]');

    function onScrollUpdate() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar && scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        progressBar.style.width = progress + '%';
      }

      if (header) {
        if (scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Highlight active nav item
      if (sections.length && navLinks.length) {
        const triggerPoint = scrollY + 160;
        sections.forEach(function (section) {
          const id = section.getAttribute('id');
          const top = section.offsetTop;
          const height = section.offsetHeight;

          if (triggerPoint >= top && triggerPoint < top + height) {
            navLinks.forEach(function (link) {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }
    }

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    onScrollUpdate();

    // 4. Smooth Scroll Reveal (Elements are visible by default; this adds an extra polish)
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
      );

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: make all visible immediately
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }

    // 5. One-Click Copy Email
    const copyBtn = document.getElementById('copyEmailBtn');
    const copyStatus = document.getElementById('copyStatus');

    if (copyBtn && copyStatus) {
      copyBtn.addEventListener('click', function () {
        const email = copyBtn.getAttribute('data-email') || 'hello@nguyenminhdang.vn';
        
        function showSuccess() {
          copyStatus.classList.add('show');
          setTimeout(function () {
            copyStatus.classList.remove('show');
          }, 3000);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(showSuccess).catch(function () {
            fallbackCopy(email);
          });
        } else {
          fallbackCopy(email);
        }

        function fallbackCopy(text) {
          try {
            const temp = document.createElement('input');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showSuccess();
          } catch (e) {
            prompt('Sao chép email của Đăng tại đây:', text);
          }
        }
      });
    }

    // 6. Interactive Contact Form Simulation
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formSubmitBtn = document.getElementById('formSubmitBtn');

    if (contactForm && formSuccess && formSubmitBtn) {
      window.handleFormSubmit = function () {
        const originalText = formSubmitBtn.innerHTML;
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = '<span>Đang gửi...</span>';

        setTimeout(function () {
          contactForm.reset();
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = originalText;
          formSuccess.style.display = 'block';

          setTimeout(function () {
            formSuccess.style.display = 'none';
          }, 6000);
        }, 600);
      };
    }

    // 7. Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Run immediately if DOM is ready, or wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();
