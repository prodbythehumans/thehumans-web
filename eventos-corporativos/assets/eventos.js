/* the humans. — eventos corporativos */
(function () {
  'use strict';

  /* ---------- i18n ---------- */
  var I18N = {
    es: {
      'hero.sub': 'Cuando el ambiente lo es todo, el sonido no puede fallar.',
      'marquee': 'Cenas de Gala · Cocktails · Team Building · Congresos · Networking · España · ',
      'bio.label': 'quiénes somos',
      'bio.title': 'Doce años de cabinas. Cinco de corporativo.',
      'bio.p1': 'Somos The Humans. Dos profesionales que combinan doce años de experiencia en cabinas con una trayectoria sólida en el entorno corporativo. Nuestro punto de partida no fue la música: fue la empresa. Conocemos de primera mano cómo funciona una organización, cómo se planifica un evento y qué espera realmente un equipo directivo cuando se sienta a cenar. Esa comprensión del mundo corporativo es la que define nuestra manera de trabajar.',
      'bio.p2': 'Contamos con formación en producción musical, ingeniería de telecomunicaciones y técnica de sonido, complementada con estudios en publicidad y marketing. No somos simplemente DJs: somos técnicos y creativos con un enfoque profesional en cada servicio que prestamos.',
      'bio.chip1': '12 años de experiencia',
      'bio.chip2': 'Toda España',
      'photos.booth': 'The Humans en cabina',
      'photos.live': 'The Humans en directo',
      'services.label': 'servicios',
      'services.title': 'Todo el ambiente, sin complicaciones.',
      'services.sub': 'Ambientación musical integral para cada momento del evento.',
      'services.s1.title': 'Cenas de Gala',
      'services.s1.body': 'Elegante ambientación musical para cenas corporativas de noche, creando el ambiente perfecto para cada momento.',
      'services.s2.title': 'Cocktails y Recepciones',
      'services.s2.body': 'Música de bienvenida y ambientación para pre-evento. El tono ideal para iniciar cada encuentro con elegancia.',
      'services.s3.title': 'Team Building',
      'services.s3.body': 'Energía dinámica para actividades de grupo. Selección musical que une equipos y potencia la experiencia colectiva.',
      'services.s4.title': 'Congresos y Jornadas',
      'services.s4.body': 'Música de fondo discreta y profesional para conferencias y jornadas. Presencia sonora sin protagonismo innecesario.',
      'services.s5.title': 'Networking',
      'services.s5.body': 'Atmósfera fluida para el networking empresarial. El sonido que facilita la conversación sin interrumpirla.',
      'services.s6.title': 'Aniversarios de Empresa',
      'services.s6.body': 'Celebraciones de hitos corporativos y galas de empresa. Una noche especial merece una banda sonora a la altura.',
      'services.f1': 'Equipo propio incluido',
      'services.f2': 'De 1 a 8 horas',
      'services.f3': 'Cobertura nacional',
      'why.label': 'por qué nosotros',
      'why.title': 'Profesionales que entienden la empresa antes que la música.',
      'why.w1.title': 'Reunión previa a cada evento',
      'why.w1.body': 'Antes de cada servicio estudiamos el perfil de los asistentes, los tiempos del programa y las preferencias del cliente. No improvisamos: llegamos con un plan.',
      'why.w2.title': 'Venimos del mundo corporativo',
      'why.w2.body': 'Entendemos la dinámica de una empresa y lo que espera un equipo directivo. Esa perspectiva cambia nuestra forma de preparar y ejecutar cada evento.',
      'why.w3.title': 'Autonomía técnica total',
      'why.w3.body': 'Solo necesitamos una mesa y un enchufe. Sin coordinación de proveedores, sin imprevistos técnicos, sin carga adicional para el organizador.',
      'why.w4.title': 'Adaptabilidad real',
      'why.w4.body': 'Doce años en todos los contextos posibles nos permiten leer cualquier sala y ajustar el sonido en tiempo real, sin que el organizador tenga que intervenir.',
      'clients.label': 'eventos y clientes',
      'clients.title': 'Espacios de referencia. Clientes que repiten.',
      'clients.s1': 'Eventos Corporativos',
      'clients.s2': 'Colaboraciones con Agencias',
      'specs.label': 'ficha técnica',
      'specs.title': 'Todo lo que necesitas saber antes de contratar.',
      'specs.r1.k': 'Equipo principal',
      'specs.r2.k': 'Sonido',
      'specs.r2.v': 'Sistema propio incluido',
      'specs.r3.k': 'Iluminación',
      'specs.r3.v': 'Incluida',
      'specs.r4.k': 'Requisitos',
      'specs.r4.v': '1 toma de corriente 220V + espacio cabina',
      'specs.r5.k': 'Idiomas',
      'specs.r5.v': 'Español · Inglés',
      'specs.r6.k': 'Cobertura',
      'specs.r6.v': 'Nacional',
      'specs.r7.k': 'Seguro R.C.',
      'specs.r7.v': 'Disponible bajo solicitud',
      'contact.label': 'contacto',
      'contact.title': 'Cuéntanos tu evento. Respondemos en menos de 24 horas.'
    },
    en: {
      'hero.sub': 'When the atmosphere is everything, the sound cannot fail.',
      'marquee': 'Gala Dinners · Cocktails · Team Building · Conferences · Networking · Spain · ',
      'bio.label': 'who we are',
      'bio.title': 'Twelve years behind the decks. Five in corporate.',
      'bio.p1': 'We are The Humans. Two professionals combining twelve years of DJ-booth experience with a solid track record in the corporate world. Our starting point was not music: it was business. We know first-hand how an organization works, how an event is planned and what an executive team really expects when they sit down for dinner. That understanding of the corporate world defines the way we work.',
      'bio.p2': 'We are trained in music production, telecommunications engineering and sound technology, complemented by studies in advertising and marketing. We are not simply DJs: we are technicians and creatives with a professional approach to every service we deliver.',
      'bio.chip1': '12 years of experience',
      'bio.chip2': 'All of Spain',
      'photos.booth': 'The Humans in the booth',
      'photos.live': 'The Humans live',
      'services.label': 'services',
      'services.title': 'All the atmosphere, none of the hassle.',
      'services.sub': 'Complete musical ambience for every moment of the event.',
      'services.s1.title': 'Gala Dinners',
      'services.s1.body': 'Elegant musical ambience for corporate evening dinners, creating the perfect atmosphere for every moment.',
      'services.s2.title': 'Cocktails & Receptions',
      'services.s2.body': 'Welcome music and pre-event ambience. The ideal tone to open every gathering with elegance.',
      'services.s3.title': 'Team Building',
      'services.s3.body': 'Dynamic energy for group activities. A musical selection that unites teams and elevates the collective experience.',
      'services.s4.title': 'Conferences & Workshops',
      'services.s4.body': 'Discreet, professional background music for conferences and business days. Sound presence without unnecessary protagonism.',
      'services.s5.title': 'Networking',
      'services.s5.body': 'A fluid atmosphere for business networking. Sound that eases conversation without interrupting it.',
      'services.s6.title': 'Company Anniversaries',
      'services.s6.body': 'Corporate milestone celebrations and company galas. A special night deserves a soundtrack to match.',
      'services.f1': 'Own equipment included',
      'services.f2': 'From 1 to 8 hours',
      'services.f3': 'Nationwide coverage',
      'why.label': 'why us',
      'why.title': 'Professionals who understand business before music.',
      'why.w1.title': 'Pre-event briefing, every time',
      'why.w1.body': 'Before every service we study the guest profile, the programme timings and the client’s preferences. We don’t improvise: we arrive with a plan.',
      'why.w2.title': 'We come from the corporate world',
      'why.w2.body': 'We understand how a company works and what an executive team expects. That perspective changes how we prepare and deliver every event.',
      'why.w3.title': 'Full technical autonomy',
      'why.w3.body': 'All we need is a table and a power socket. No supplier coordination, no technical surprises, no extra load on the organizer.',
      'why.w4.title': 'Real adaptability',
      'why.w4.body': 'Twelve years across every possible context let us read any room and adjust the sound in real time, without the organizer having to step in.',
      'clients.label': 'events & clients',
      'clients.title': 'Reference venues. Clients who come back.',
      'clients.s1': 'Corporate Events',
      'clients.s2': 'Agency Collaborations',
      'specs.label': 'tech rider',
      'specs.title': 'Everything you need to know before booking.',
      'specs.r1.k': 'Main equipment',
      'specs.r2.k': 'Sound',
      'specs.r2.v': 'Own system included',
      'specs.r3.k': 'Lighting',
      'specs.r3.v': 'Included',
      'specs.r4.k': 'Requirements',
      'specs.r4.v': '1 × 220V power socket + booth space',
      'specs.r5.k': 'Languages',
      'specs.r5.v': 'Spanish · English',
      'specs.r6.k': 'Coverage',
      'specs.r6.v': 'Nationwide (Spain)',
      'specs.r7.k': 'Liability insurance',
      'specs.r7.v': 'Available on request',
      'contact.label': 'contact',
      'contact.title': 'Tell us about your event. We reply within 24 hours.'
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
    document.querySelectorAll('[data-i18n-clone]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-clone');
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });
  }

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || key;
  }

  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLang(b.dataset.lang);
      document.querySelectorAll('.lang-btn').forEach(function (x) {
        x.classList.toggle('active', x.dataset.lang === lang);
      });
    });
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

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  /* ---------- hero image load + exit fade ---------- */
  var heroContent = document.querySelector('.hero-content');
  var heroImg = document.getElementById('hero-img');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxStage = document.getElementById('lightbox-stage');
  var lightboxCap = document.getElementById('lightbox-caption');

  function openPhoto(src, caption) {
    var img = document.createElement('img');
    img.className = 'lightbox-img';
    img.src = src;
    img.alt = caption;
    lightboxStage.innerHTML = '';
    lightboxStage.appendChild(img);
    lightboxCap.textContent = caption;
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      lightbox.hidden = true;
      lightboxStage.innerHTML = '';
    }, 350);
  }

  document.querySelectorAll('.gallery-item').forEach(function (fig) {
    var img = fig.querySelector('img');
    if (!img) return;
    fig.addEventListener('click', function () {
      var capKey = img.getAttribute('data-caption-i18n');
      var caption = capKey ? t(capKey) : (img.getAttribute('data-caption') || img.alt);
      openPhoto(img.src, caption);
    });
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* init */
  applyLang(lang);
})();
