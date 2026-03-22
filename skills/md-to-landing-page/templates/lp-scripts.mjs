/**
 * GSAP scripts for Landing Page animations and interactions.
 * Conditionally includes code blocks for enabled LP effects.
 */

/**
 * Get JavaScript string for LP GSAP mode.
 * @param {object} effectsConfig - LP effects flags from lp-effects.mjs
 * @returns {string} Complete JavaScript string
 */
export function getLPScripts(effectsConfig) {
  let script = `
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
`;

  // Text reveal animation (from base)
  if (effectsConfig.textReveal) {
    script += `
  // Text reveal on scroll
  gsap.utils.toArray('[data-gsap="fade-up"]').forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
`;
  }

  // Staggered cards (from base)
  if (effectsConfig.staggeredCards) {
    script += `
  // Staggered cards animation
  gsap.utils.toArray('[data-gsap="stagger"]').forEach(container => {
    const children = container.children;
    gsap.from(children, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
`;
  }

  // Animated counters (from base)
  if (effectsConfig.animatedCounters) {
    script += `
  // Animated counters
  gsap.utils.toArray('[data-counter]').forEach(el => {
    const target = el.getAttribute('data-counter');
    const numericValue = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      const suffix = target.replace(/[0-9.,]/g, '');
      const obj = { value: 0 };
      gsap.to(obj, {
        value: numericValue,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.value).toLocaleString('pt-BR') + suffix;
        }
      });
    }
  });
`;
  }

  // CTA Pulse — pulse animation on CTA buttons when they scroll into view
  if (effectsConfig.ctaPulse) {
    script += `
  // CTA pulse on scroll into view
  gsap.utils.toArray('.lp-cta-btn').forEach(btn => {
    ScrollTrigger.create({
      trigger: btn,
      start: 'top 90%',
      onEnter: () => btn.classList.add('cta-pulse'),
    });
  });
`;
  }

  // Testimonial carousel — auto-rotate testimonials
  if (effectsConfig.testimonialCarousel) {
    script += `
  // Testimonial carousel
  const carouselTrack = document.querySelector('.lp-testimonials-track');
  const carouselDots = document.querySelectorAll('.lp-carousel-dot');
  if (carouselTrack && carouselDots.length > 0) {
    let currentSlide = 0;
    const cards = carouselTrack.querySelectorAll('.lp-testimonial-card');
    const isMobile = window.innerWidth < 768;
    const slidesPerView = isMobile ? 1 : 2;
    const totalSlides = Math.ceil(cards.length / slidesPerView);

    function goToSlide(index) {
      currentSlide = index;
      const offset = -(index * (100 / totalSlides));
      carouselTrack.style.transform = 'translateX(' + offset + '%)';
      carouselDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    carouselDots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });

    // Auto-rotate every 5s
    let carouselInterval = setInterval(() => {
      goToSlide((currentSlide + 1) % totalSlides);
    }, 5000);

    // Pause on hover
    carouselTrack.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carouselTrack.addEventListener('mouseleave', () => {
      carouselInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % totalSlides);
      }, 5000);
    });
  }
`;
  }

  // Pricing glow — glow effect on pricing card hover
  if (effectsConfig.pricingGlow) {
    script += `
  // Pricing glow on hover
  const offerCard = document.querySelector('.lp-offer-card');
  if (offerCard) {
    offerCard.classList.add('pricing-glow');
  }
`;
  }

  // Sticky CTA bar — appears after scrolling past hero
  if (effectsConfig.stickyCTA) {
    script += `
  // Sticky CTA bar visibility
  const stickyCTA = document.querySelector('.lp-sticky-cta');
  if (stickyCTA) {
    ScrollTrigger.create({
      trigger: '.lp-hero',
      start: 'bottom top',
      onEnter: () => stickyCTA.classList.add('visible'),
      onLeaveBack: () => stickyCTA.classList.remove('visible'),
    });

    // Hide when near footer
    const footer = document.querySelector('.lp-footer');
    if (footer) {
      ScrollTrigger.create({
        trigger: footer,
        start: 'top bottom',
        onEnter: () => stickyCTA.classList.remove('visible'),
        onLeaveBack: () => stickyCTA.classList.add('visible'),
      });
    }
  }
`;
  }

  // FAQ accordion
  if (effectsConfig.faqAccordion) {
    script += `
  // FAQ accordion toggle
  document.querySelectorAll('.lp-faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.lp-faq-item');
      const wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.lp-faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Toggle clicked
      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });
`;
  }

  // Parallax hero background
  if (effectsConfig.parallaxHero) {
    script += `
  // Parallax hero background
  const heroBg = document.querySelector('.lp-hero-bg');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.lp-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
`;
  }

  // Gradient text (from base)
  if (effectsConfig.gradientText) {
    script += `
  // Apply gradient text to hero title
  const heroTitle = document.querySelector('.lp-hero h1');
  if (heroTitle) {
    heroTitle.classList.add('gradient-text');
  }
`;
  }

  // Glassmorphism (from base)
  if (effectsConfig.glassmorphism) {
    script += `
  // Apply glassmorphism to cards
  gsap.utils.toArray('[data-glass]').forEach(el => {
    el.classList.add('glass-card');
  });
`;
  }

  // Theme toggle (always)
  script += `
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || htmlEl.getAttribute('data-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.querySelector('span').textContent = theme === 'dark' ? '🌙' : '☀️';
  }
`;

  // Smooth scroll for anchor links
  script += `
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
`;

  // Close DOMContentLoaded
  script += `
});
`;

  return script;
}
