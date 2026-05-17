(function () {
  'use strict';

  var WHATSAPP_NUMBER = '919486981357';
  var ROTATE_WORDS = ['future', 'potential', 'grades', 'confidence'];

  var modal = document.getElementById('demoModal');
  var form = document.getElementById('demoForm');
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var header = document.querySelector('.header');
  var rotateEl = document.getElementById('rotateWord');
  var yearEl = document.getElementById('year');

  var studentName = document.getElementById('studentName');
  var phone = document.getElementById('phone');
  var studentClass = document.getElementById('studentClass');
  var otherClassGroup = document.getElementById('otherClassGroup');
  var otherClass = document.getElementById('otherClass');
  var whatsappBtn = document.getElementById('whatsappBtn');

  var heroBadges = document.querySelectorAll('.hero__badge[data-hero-theme]');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Modal */
  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var firstInput = modal.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function closeNav() {
    if (navMenu) navMenu.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open', !expanded);
    });
    navMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* Header scroll shadow */
  if (header) {
    window.addEventListener(
      'scroll',
      function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      },
      { passive: true }
    );
  }

  /* Hero theme toggle */
  function setHeroTheme(theme) {
    heroBadges.forEach(function (badge) {
      var active = badge.getAttribute('data-hero-theme') === theme;
      badge.classList.toggle('is-active', active);
      badge.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.dispatchEvent(
      new CustomEvent('hero-theme-change', { detail: { theme: theme } })
    );
  }

  heroBadges.forEach(function (badge) {
    badge.addEventListener('click', function () {
      setHeroTheme(badge.getAttribute('data-hero-theme'));
    });
  });

  /* Form validation */
  function toggleOtherClass() {
    var isOther = studentClass && studentClass.value === 'other';
    if (otherClassGroup) otherClassGroup.classList.toggle('is-visible', isOther);
    if (!isOther && otherClass) otherClass.value = '';
  }

  if (studentClass) {
    studentClass.addEventListener('change', function () {
      toggleOtherClass();
      validateForm();
    });
  }

  function getClassValue() {
    if (!studentClass || !studentClass.value) return '';
    if (studentClass.value === 'other') {
      return otherClass ? otherClass.value.trim() : '';
    }
    return studentClass.value;
  }

  function showError(field, errorEl, message) {
    if (field) field.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field, errorEl) {
    if (field) field.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function validateName() {
    var el = document.getElementById('nameError');
    var val = studentName ? studentName.value.trim() : '';
    if (val.length < 2) {
      showError(studentName, el, 'Please enter a valid student name.');
      return false;
    }
    clearError(studentName, el);
    return true;
  }

  function validatePhone() {
    var el = document.getElementById('phoneError');
    var digits = phone ? phone.value.replace(/\D/g, '') : '';
    if (digits.length < 7 || digits.length > 15) {
      showError(phone, el, 'Enter a valid mobile number with country code (7–15 digits).');
      return false;
    }
    clearError(phone, el);
    return true;
  }

  function validateClass() {
    var el = document.getElementById('classError');
    var otherEl = document.getElementById('otherClassError');
    if (!studentClass || !studentClass.value) {
      showError(studentClass, el, 'Please select a class.');
      return false;
    }
    clearError(studentClass, el);
    if (studentClass.value === 'other') {
      var otherVal = otherClass ? otherClass.value.trim() : '';
      if (otherVal.length < 1) {
        showError(otherClass, otherEl, 'Please specify the class.');
        return false;
      }
      clearError(otherClass, otherEl);
    } else if (otherEl) {
      clearError(otherClass, otherEl);
    }
    return true;
  }

  function validateForm() {
    var valid = validateName() & validatePhone() & validateClass();
    if (whatsappBtn) whatsappBtn.disabled = !valid;
    return !!valid;
  }

  if (studentName) {
    studentName.addEventListener('input', validateForm);
    studentName.addEventListener('blur', validateName);
  }
  if (phone) {
    phone.addEventListener('input', validateForm);
    phone.addEventListener('blur', validatePhone);
  }
  if (otherClass) otherClass.addEventListener('input', validateForm);

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) return;
      var name = studentName.value.trim();
      var classVal = getClassValue();
      var message =
        "Hello, I'm " +
        name +
        " and I'm studying in " +
        classVal +
        '. I would like to book a free demo class for maths tuition.';
      window.open(
        'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message),
        '_blank',
        'noopener,noreferrer'
      );
      closeModal();
    });
  }

  /* Rotating headline */
  var rotateIndex = 0;
  function rotateWord() {
    if (!rotateEl) return;
    rotateEl.classList.add('is-fading');
    setTimeout(function () {
      rotateIndex = (rotateIndex + 1) % ROTATE_WORDS.length;
      rotateEl.textContent = ROTATE_WORDS[rotateIndex];
      rotateEl.classList.remove('is-fading');
    }, 250);
  }

  if (rotateEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(rotateWord, 3000);
  }

  /* Scroll reveal — lightweight, minimal perf impact */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );
      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    }
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  var heroReveal = document.getElementById('hero');
  if (heroReveal) heroReveal.classList.add('is-visible');

  toggleOtherClass();
  validateForm();
  if (heroBadges.length) setHeroTheme('results');

  function closeFaqItem(item) {
    if (!item) return;
    var btn = item.querySelector('.faq__question');
    var answer = item.querySelector('.faq__answer');
    item.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (answer) answer.hidden = true;
  }

  function openFaqItem(item) {
    if (!item) return;
    var btn = item.querySelector('.faq__question');
    var answer = item.querySelector('.faq__answer');
    item.classList.add('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (answer) answer.hidden = false;
  }

  document.querySelectorAll('[data-faq-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      if (!item) return;
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('#faq .faq__item.is-open').forEach(function (openItem) {
        if (openItem !== item) closeFaqItem(openItem);
      });
      if (isOpen) {
        closeFaqItem(item);
      } else {
        openFaqItem(item);
      }
    });
  });
})();
