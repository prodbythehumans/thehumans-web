/* the humans. — press kit */
(function () {
  'use strict';

  var DATA = 'data/';
  var THUMB = function (id, w) {
    return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + (w || 1600);
  };
  var PREVIEW = function (id) {
    return 'https://drive.google.com/file/d/' + id + '/preview';
  };

  /* ---------- i18n ---------- */
  var I18N = {
    es: {
      'hero.kicker': 'digital press kit',
      'hero.sub': 'DJs & productores — Madrid, España',
      'bio.label': 'quiénes somos',
      'bio.title': 'El punto de cruce entre lo que suena ahora y lo que vendrá después.',
      'bio.p1': 'THE HUMANS es un dúo de DJs y productores formado por DILEMMA y JORGE RODRIZ, dos nombres clave en el nuevo sonido urbano español. Con una propuesta que combina criterio musical, energía en cabina y visión de futuro, se han posicionado como uno de los proyectos más sólidos de la escena actual.',
      'bio.p2': 'Mezclan hits reconocibles con tendencias emergentes, funcionando como vía de viralización y con una narrativa propia. Su propuesta no solo llena la pista: la transforma.',
      'milestones.label': 'trayectoria',
      'milestones.m1.title': 'FITZ Madrid × Bad Bunny',
      'milestones.m1.body': 'Dos actuaciones en el Afterparty Oficial de Bad Bunny, tour «Debí Tirar Más Fotos».',
      'milestones.m2.title': 'Afterparty Oficial de Rauw Alejandro',
      'milestones.m2.body': 'Seleccionados para el afterparty oficial del artista en Madrid.',
      'milestones.m3.title': "Residencia en Tiffany's",
      'milestones.m3.body': 'Una de las salas más exclusivas de Madrid.',
      'milestones.m4.title': 'DJs oficiales del Getafe CF',
      'milestones.m4.body': 'Equipo de Primera División Española.',
      'milestones.m5.title': 'Top 28 en México',
      'milestones.m5.body': 'Como productores, con producciones en un álbum #1 global en Spotify.',
      'streams.label': 'streams',
      'streams.totalLabel': 'streams combinados',
      'streams.appleNote': 'estimado — Apple Music no publica datos',
      'gallery.label': 'fotos',
      'videos.label': 'vídeos',
      'contact.label': 'contacto'
    },
    en: {
      'hero.kicker': 'digital press kit',
      'hero.sub': 'DJs & producers — Madrid, Spain',
      'bio.label': 'who we are',
      'bio.title': 'The crossing point between what sounds now and what comes next.',
      'bio.p1': 'THE HUMANS is a DJ and production duo formed by DILEMMA and JORGE RODRIZ, two key names in the new Spanish urban sound. With a proposal combining musical criteria, booth energy and forward vision, they have positioned themselves as one of the most solid projects in the current scene.',
      'bio.p2': 'They blend recognizable hits with emerging trends, acting as a virality channel with a narrative of their own. Their set does not just fill the dancefloor: it transforms it.',
      'milestones.label': 'highlights',
      'milestones.m1.title': 'FITZ Madrid × Bad Bunny',
      'milestones.m1.body': 'Two performances at Bad Bunny’s Official Afterparty, “Debí Tirar Más Fotos” tour.',
      'milestones.m2.title': 'Rauw Alejandro Official Afterparty',
      'milestones.m2.body': 'Selected for the artist’s official afterparty in Madrid.',
      'milestones.m3.title': "Tiffany's residency",
      'milestones.m3.body': 'One of Madrid’s most exclusive clubs.',
      'milestones.m4.title': 'Official DJs of Getafe CF',
      'milestones.m4.body': 'Spanish First Division football club.',
      'milestones.m5.title': 'Top 28 in Mexico',
      'milestones.m5.body': 'As producers, with credits on a #1 global album on Spotify.',
      'streams.label': 'streams',
      'streams.totalLabel': 'combined streams',
      'streams.appleNote': 'estimated — Apple Music does not publish data',
      'gallery.label': 'photos',
      'videos.label': 'videos',
      'contact.label': 'contact'
    }
  };

  var lang = localStorage.getItem('th-lang') || 'es';

  function applyLang(l) {
    lang = I18N[l] ? l : 'es';
    localStorage.setItem('th-lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
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

  function observeAll() {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- hero exit fade ---------- */
  var heroContent = document.querySelector('.hero-content');
  var heroImg = document.getElementById('hero-img');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- number formatting + count-up ---------- */
  function fmt(n) {
    return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');
  }

  function countUp(el, target, suffixPlus) {
    if (reduced) {
      el.innerHTML = fmt(target) + (suffixPlus ? '<span class="plus">+</span>' : '');
      return;
    }
    var dur = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.innerHTML = fmt(Math.round(target * eased)) + (suffixPlus ? '<span class="plus">+</span>' : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- data load ---------- */
  Promise.all([
    fetch(DATA + 'media.json').then(function (r) { return r.json(); }),
    fetch(DATA + 'config.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    var media = res[0];
    var config = res[1];
    render(media, config);
  }).catch(function (err) {
    console.error('Error cargando datos del press kit:', err);
  });

  function byId(list) {
    var m = {};
    list.forEach(function (x) { m[x.id] = x; });
    return m;
  }

  function cleanName(name) {
    return name.replace(/\.[^.]+$/, '');
  }

  function render(media, config) {
    /* hero */
    var heroId = config.heroPhotoId || (media.photos[0] && media.photos[0].id);
    if (heroId && heroImg) {
      heroImg.src = THUMB(heroId, 2000);
      heroImg.addEventListener('load', function () { heroImg.classList.add('loaded'); });
    }

    /* streams */
    var s = config.streams || {};
    var vals = [s.spotify || 0, s.youtube || 0, s.appleMusic || 0];
    var sum = vals[0] + vals[1] + vals[2];
    var totalEl = document.getElementById('total-streams');
    var grid = document.getElementById('streams-grid');

    var useFallback = sum === 0 && s.totalFallback;
    var total = useFallback ? s.totalFallback : sum;

    if (useFallback && grid) grid.classList.add('hidden');

    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        statObserver.unobserve(e.target);
        if (e.target === totalEl) {
          countUp(totalEl, total, true);
        } else {
          var plat = e.target.closest('.stream-card').dataset.platform;
          countUp(e.target, s[plat] || 0, false);
        }
      });
    }, { threshold: 0.4 });

    if (totalEl) statObserver.observe(totalEl);
    if (!useFallback) {
      document.querySelectorAll('.stream-num').forEach(function (el) {
        statObserver.observe(el);
      });
    }

    /* gallery — newest first, only selected */
    var photoMap = byId(media.photos);
    var photos = (config.selectedPhotos || [])
      .map(function (id) { return photoMap[id]; })
      .filter(Boolean)
      .sort(function (a, b) { return b.createdTime.localeCompare(a.createdTime); });

    var gallery = document.getElementById('gallery');
    photos.forEach(function (p) {
      var cell = document.createElement('div');
      cell.className = 'gallery-cell';
      var fig = document.createElement('figure');
      fig.className = 'gallery-item reveal';
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = THUMB(p.id, 800);
      img.alt = cleanName(p.name);
      var cap = document.createElement('p');
      cap.className = 'gallery-caption';
      cap.textContent = cleanName(p.name);
      fig.appendChild(img);
      cell.appendChild(fig);
      cell.appendChild(cap);
      gallery.appendChild(cell);
      fig.addEventListener('click', function () { openLightbox(p); });
    });

    /* videos — newest first, only selected */
    var videoMap = byId(media.videos);
    var videos = (config.selectedVideos || [])
      .map(function (id) { return videoMap[id]; })
      .filter(Boolean)
      .sort(function (a, b) { return b.createdTime.localeCompare(a.createdTime); });

    var vgrid = document.getElementById('videos-grid');
    videos.forEach(function (v) {
      var wrap = document.createElement('div');
      wrap.className = 'video-item reveal';
      var frame = document.createElement('div');
      frame.className = 'video-frame';
      var iframe = document.createElement('iframe');
      iframe.loading = 'lazy';
      iframe.src = PREVIEW(v.id);
      iframe.allow = 'autoplay; fullscreen';
      iframe.title = cleanName(v.name);
      frame.appendChild(iframe);
      var cap = document.createElement('p');
      cap.className = 'video-caption';
      cap.textContent = cleanName(v.name);
      wrap.appendChild(frame);
      wrap.appendChild(cap);
      vgrid.appendChild(wrap);
    });

    observeAll();
  }

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCap = document.getElementById('lightbox-caption');

  function openLightbox(photo) {
    lightboxImg.src = THUMB(photo.id, 2000);
    lightboxCap.textContent = cleanName(photo.name);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { lightbox.hidden = true; }, 350);
  }

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* init */
  applyLang(lang);
  observeAll();
})();
