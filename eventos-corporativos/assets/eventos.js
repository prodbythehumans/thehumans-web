/* the humans. — eventos corporativos */
(function () {
  'use strict';

  var DATA = 'data/';

  /* Fallback dictionary: mirrors the hardcoded HTML so the page still works
     if content.json fails to load. Overwritten by content.json when present. */
  var I18N = { es: {}, en: {} };
  var IMAGES = {};
  var VERSION = '';

  var lang = localStorage.getItem('th-lang') || 'es';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- apply text + images ---------- */
  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || (I18N.es && I18N.es[key]) || '';
  }

  function applyLang(l) {
    lang = I18N[l] ? l : (I18N[lang] ? lang : 'es');
    localStorage.setItem('th-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-clone]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-clone'));
      if (v) el.textContent = v;
    });

    /* contact links: text + href */
    var email = t('contact.email');
    var p1 = t('contact.phone1');
    var p2 = t('contact.phone2');
    setLink('c-email', email, 'mailto:' + email);
    setLink('c-phone1', p1, 'tel:' + p1.replace(/\s/g, ''));
    setLink('c-phone2', p2, 'tel:' + p2.replace(/\s/g, ''));

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function setLink(id, text, href) {
    var el = document.getElementById(id);
    if (!el || !text) return;
    el.textContent = text;
    el.setAttribute('href', href);
  }

  function applyImages() {
    document.querySelectorAll('[data-img]').forEach(function (img) {
      var slot = IMAGES[img.getAttribute('data-img')];
      if (!slot) return;
      if (slot.src) img.src = slot.src + (VERSION ? '?v=' + VERSION : '');
      if (slot.alt != null) img.alt = slot.alt;
    });
  }

  /* ---------- data load ---------- */
  fetch(DATA + 'content.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.texts) I18N = data.texts;
      if (data.images) IMAGES = data.images;
      VERSION = data.updatedAt ? String(Date.parse(data.updatedAt) || '') : '';
      applyLang(lang);
      applyImages();
      buildGallery();
    })
    .catch(function (err) {
      console.error('No se pudo cargar content.json, usando textos por defecto:', err);
      buildGallery();
    });

  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  /* ---------- reveal on scroll ---------- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

  /* ---------- hero image load + exit fade ---------- */
  var heroContent = document.querySelector('.hero-content');
  var heroImg = document.getElementById('hero-img');

  if (heroImg) {
    if (heroImg.complete) heroImg.classList.add('loaded');
    else heroImg.addEventListener('load', function () { heroImg.classList.add('loaded'); });
  }

  if (!reduced) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var h = window.innerHeight;
        if (y < h && heroContent) {
          var p = y / h;
          heroContent.style.opacity = String(1 - p * 1.3);
          heroContent.style.transform = 'translateY(' + (p * 60) + 'px)';
          heroContent.style.filter = 'blur(' + (p * 8) + 'px)';
          if (heroImg) heroImg.style.transform = 'scale(' + (1 + p * 0.06) + ') translateY(' + (p * 40) + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- gallery + lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var stage = document.getElementById('lightbox-stage');
  var capEl = document.getElementById('lightbox-caption');
  var counterEl = document.getElementById('lightbox-counter');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');

  var items = [];      // { src, alt } in DOM order
  var current = -1;
  var currentImg = null;

  function buildGallery() {
    var figs = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
    items = figs.map(function (img) { return img; });
    figs.forEach(function (img, i) {
      var fig = img.closest('.gallery-item');
      fig.addEventListener('click', function () { open(i); });
    });
  }

  function open(i) {
    current = i;
    showCurrent(0);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function showCurrent(dir) {
    var src = items[current].currentSrc || items[current].src;
    var alt = items[current].alt || '';

    var img = document.createElement('img');
    img.className = 'lightbox-img';
    img.src = src;
    img.alt = alt;
    if (!reduced) {
      img.style.opacity = '0';
      if (dir) img.style.transform = 'translateX(' + (dir * 26) + 'px)';
    }

    var old = currentImg;
    stage.appendChild(img);
    currentImg = img;

    requestAnimationFrame(function () {
      img.style.opacity = '1';
      img.style.transform = 'translateX(0)';
      if (old) {
        old.style.opacity = '0';
        if (!reduced) old.style.transform = 'translateX(' + (-dir * 26) + 'px)';
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 320);
      }
    });

    capEl.textContent = alt;
    counterEl.textContent = (current + 1) + ' / ' + items.length;
  }

  function go(delta) {
    if (!items.length) return;
    current = (current + delta + items.length) % items.length;
    showCurrent(delta);
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      lightbox.hidden = true;
      stage.innerHTML = '';
      currentImg = null;
      current = -1;
    }, 340);
  }

  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === stage || e.target.classList.contains('lightbox-close')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  /* swipe on touch */
  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* init: apply default active state before content.json resolves */
  applyLang(lang);
})();
