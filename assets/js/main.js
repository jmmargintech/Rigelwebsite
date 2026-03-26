(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  var navGroups = document.querySelectorAll('.nav-group');

  function closeNavGroups(exceptGroup) {
    navGroups.forEach(function (group) {
      if (group !== exceptGroup) {
        group.classList.remove('open');
        var toggle = group.querySelector('.nav-group-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      if (!navLinks.classList.contains('open')) {
        closeNavGroups();
      }
    });
  }

  if (navGroups.length) {
    navGroups.forEach(function (group) {
      var toggle = group.querySelector('.nav-group-toggle');
      if (!toggle) {
        return;
      }

      toggle.addEventListener('click', function () {
        var isOpen = group.classList.contains('open');
        closeNavGroups(group);
        group.classList.toggle('open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.nav-links')) {
        closeNavGroups();
      }
    });
  }

  var currentPage = document.body.getAttribute('data-page');
  if (currentPage) {
    var active = document.querySelector('[data-page-link="' + currentPage + '"]');
    if (active) {
      active.classList.add('active');

      var parentGroup = active.closest('.nav-group');
      if (parentGroup) {
        var groupToggle = parentGroup.querySelector('.nav-group-toggle');
        if (groupToggle) {
          groupToggle.classList.add('active');
        }
      }
    }
  }

  var revealNodes = document.querySelectorAll('.reveal');
  if (revealNodes.length) {
    revealNodes.forEach(function (node, index) {
      node.style.transitionDelay = Math.min(index * 70, 420) + 'ms';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  var slider = document.querySelector('[data-testimonial-slider]');
  if (slider) {
    var track = slider.querySelector('[data-testimonial-track]');
    var slides = track ? track.querySelectorAll('.quote-card') : [];
    var prevBtn = slider.querySelector('[data-testimonial-prev]');
    var nextBtn = slider.querySelector('[data-testimonial-next]');
    var dots = slider.querySelectorAll('[data-slide-to]');
    var activeIndex = 0;
    var autoplayId = null;

    function renderSlider(index) {
      if (!track || !slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + activeIndex * 100 + '%)';

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === activeIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', String(isActive));
      });
    }

    function startAutoplay() {
      if (autoplayId || slides.length < 2) {
        return;
      }

      autoplayId = window.setInterval(function () {
        renderSlider(activeIndex + 1);
      }, 5000);
    }

    function stopAutoplay() {
      if (!autoplayId) {
        return;
      }

      window.clearInterval(autoplayId);
      autoplayId = null;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        renderSlider(activeIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        renderSlider(activeIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide-to'));
        renderSlider(index);
      });
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    renderSlider(0);
    startAutoplay();
  }

  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    var toast = document.querySelector('[data-contact-toast]');
    var toastClose = document.querySelector('[data-contact-toast-close]');
    var toastTitle = toast ? toast.querySelector('strong') : null;
    var toastMessage = toast ? toast.querySelector('p') : null;
    var submitButton = contactForm.querySelector('[data-contact-submit]');
    var defaultSubmitLabel = submitButton ? submitButton.textContent : '';
    var toastTimerId = null;

    function showContactToast(variant, title, message) {
      if (!toast) {
        return;
      }

      toast.classList.remove('is-error');
      if (variant === 'error') {
        toast.classList.add('is-error');
      }

      if (toastTitle) {
        toastTitle.textContent = title;
      }

      if (toastMessage) {
        toastMessage.textContent = message;
      }

      toast.classList.add('show');
      toast.setAttribute('aria-hidden', 'false');

      if (toastTimerId) {
        window.clearTimeout(toastTimerId);
      }

      toastTimerId = window.setTimeout(function () {
        toast.classList.remove('show');
        toast.setAttribute('aria-hidden', 'true');
      }, 4500);
    }

    if (toastClose && toast) {
      toastClose.addEventListener('click', function () {
        toast.classList.remove('show');
        toast.setAttribute('aria-hidden', 'true');
        if (toastTimerId) {
          window.clearTimeout(toastTimerId);
          toastTimerId = null;
        }
      });
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!contactForm.reportValidity()) {
        return;
      }

      var formData = new FormData(contactForm);
      var fullName = String(formData.get('fullName') || '').trim();
      var email = String(formData.get('email') || '').trim();
      var phone = String(formData.get('phone') || '').trim();
      var topic = String(formData.get('topic') || '').trim();
      var message = String(formData.get('message') || '').trim();
      var endpoint = contactForm.getAttribute('data-contact-endpoint');
      var payload = new FormData();

      payload.append('name', fullName);
      payload.append('email', email);
      payload.append('phone', phone || 'Not provided');
      payload.append('topic', topic || 'General enquiry');
      payload.append('message', message);
      payload.append('_subject', 'Rigel Market Contact Query' + (topic ? ' - ' + topic : ''));
      payload.append('_captcha', 'false');
      payload.append('_template', 'table');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: payload
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Request failed');
        }

        return response.json();
      }).then(function () {
        contactForm.reset();
        showContactToast('success', 'Message sent', 'Your support request has been sent to support@rigelmarket.com.');
      }).catch(function () {
        showContactToast('error', 'Message not sent', 'The request could not be completed right now. Please try again shortly or email support directly.');
      }).finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = defaultSubmitLabel;
        }
      });
    });
  }
})();
