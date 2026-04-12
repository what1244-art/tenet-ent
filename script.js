/* ============================================================
   TENET — script.js
   Raw Prestige Design System
   ============================================================ */

(function () {
  'use strict';

  /* ── AOS Init ─────────────────────────────────────────────── */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 700,
      easing: 'ease-out-quad',
      once: true,
      offset: 60,
    });
  }

  /* ── NAV: scroll class + mobile toggle ───────────────────── */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');

    if (!nav) return;

    // Scroll state
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-label', '메뉴 열기');
          document.body.style.overflow = '';
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && links.classList.contains('open')) {
          links.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-label', '메뉴 열기');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ── COUNTER animation ───────────────────────────────────── */
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    var duration = 1800;
    var start = null;
    var startVal = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var current = Math.round(startVal + easeOutQuart(progress) * (target - startVal));
      el.textContent = current.toLocaleString('ko-KR');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('ko-KR');
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('.proof-num[data-target]');
    if (!counters.length) return;

    var observed = new Set();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── FAQ accordion ───────────────────────────────────────── */
  function initFAQ() {
    var faqList = document.getElementById('faqList');
    if (!faqList) return;

    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-q');
      if (!btn) return;

      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all
      faqList.querySelectorAll('.faq-item').forEach(function (fi) {
        fi.classList.remove('open');
        fi.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (toggle)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var navH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '64',
          10
        );
        var top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ── Lazy image fade-in ──────────────────────────────────── */
  function initImageFadeIn() {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length) return;

    imgs.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', function () {
          img.style.opacity = '1';
        });
        img.addEventListener('error', function () {
          img.style.opacity = '0.3';
        });
      }
    });
  }

  /* ── Active nav link on scroll ───────────────────────────── */
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    var navH = 80;

    function updateActive() {
      var scrollY = window.scrollY + navH + 10;
      var current = '';

      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollY) {
          current = sec.id;
        }
      });

      navLinks.forEach(function (a) {
        a.classList.toggle(
          'active',
          a.getAttribute('href') === '#' + current
        );
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ── Hero parallax (subtle) ──────────────────────────────── */
  function initParallax() {
    var heroImg = document.querySelector('.hero-img');
    if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          heroImg.style.transform = 'translateY(' + scrollY * 0.25 + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Init all ────────────────────────────────────────────── */
  function init() {
    initAOS();
    initNav();
    initCounters();
    initFAQ();
    initSmoothScroll();
    initImageFadeIn();
    initActiveNav();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
