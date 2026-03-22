/**
 * GSAP scripts for animations and interactions.
 * Only includes code blocks for enabled effects.
 */

/**
 * Get JavaScript string for GSAP mode.
 * @param {object} effectsConfig - Effects flags from effects-config.mjs
 * @returns {string} Complete JavaScript string
 */
export function getGSAPScripts(effectsConfig) {
  let script = `
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Wait for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
`;

  // Text reveal animation
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

  // Animated counters
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
          el.textContent = Math.round(obj.value) + suffix;
        }
      });
    }
  });
`;
  }

  // Parallax effect
  if (effectsConfig.parallax) {
    script += `
  // Parallax hero background
  const heroBackground = document.querySelector('#hero > div.absolute');
  if (heroBackground) {
    gsap.to(heroBackground, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
`;
  }

  // Staggered cards
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

  // Magnetic buttons
  if (effectsConfig.magneticButtons) {
    script += `
  // Magnetic buttons effect
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
`;
  }

  // Cursor glow
  if (effectsConfig.cursorGlow) {
    script += `
  // Cursor glow effect
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(cursorGlow, {
        x: mouseX,
        y: mouseY,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }
`;
  }

  // Loading screen
  if (effectsConfig.loadingScreen) {
    script += `
  // Hide loading screen on load
  window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          loadingScreen.style.display = 'none';
        }
      });
    }
  });
`;
  }

  // Gradient text animation
  if (effectsConfig.gradientText) {
    script += `
  // Apply gradient text to hero title and section headings
  const heroTitle = document.querySelector('#hero h1');
  if (heroTitle) {
    heroTitle.classList.add('gradient-text-animated');
  }
  gsap.utils.toArray('h2').forEach(h2 => {
    const span = document.createElement('span');
    span.className = 'gradient-text';
    span.textContent = h2.textContent;
    h2.textContent = '';
    h2.appendChild(span);
  });
`;
  }

  // Glow cards
  if (effectsConfig.glowCards) {
    script += `
  // Add glow effect to stat cards
  gsap.utils.toArray('[data-glow]').forEach(card => {
    card.classList.add('glow-card');
  });
`;
  }

  // Mesh background
  if (effectsConfig.meshBackground) {
    script += `
  // Add mesh background to hero
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.classList.add('mesh-bg');
  }
`;
  }

  // Grid pattern
  if (effectsConfig.gridPattern) {
    script += `
  // Add grid pattern to hero
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.classList.add('grid-pattern');
  }
`;
  }

  // Floating elements
  if (effectsConfig.floatingElements) {
    script += `
  // Add floating decorative elements to hero
  const heroContainer = document.getElementById('hero');
  if (heroContainer) {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--primary) / 0.5)'
    ];
    colors.forEach((color, i) => {
      const el = document.createElement('div');
      el.className = 'floating-element';
      el.style.cssText = 'width:' + (80 + i * 40) + 'px;height:' + (80 + i * 40) + 'px;background:' + color + ';top:' + (20 + i * 25) + '%;left:' + (10 + i * 30) + '%';
      heroContainer.appendChild(el);
    });
  }
`;
  }

  // Typewriter effect
  if (effectsConfig.typewriter) {
    script += `
  // Typewriter effect on hero subtitle
  const heroSubtitle = document.querySelector('#hero p');
  if (heroSubtitle) {
    const fullText = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.classList.add('typewriter-cursor');
    let charIndex = 0;

    function typeChar() {
      if (charIndex < fullText.length) {
        heroSubtitle.textContent = fullText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeChar, 30 + Math.random() * 40);
      } else {
        heroSubtitle.classList.remove('typewriter-cursor');
      }
    }

    // Start after a short delay
    setTimeout(typeChar, 800);
  }
`;
  }

  // Spotlight cursor
  if (effectsConfig.spotlightCursor) {
    script += `
  // Spotlight cursor effect
  const spotlightEl = document.getElementById('spotlight-cursor');
  if (spotlightEl) {
    document.addEventListener('mousemove', (e) => {
      gsap.to(spotlightEl, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }
`;
  }

  // Shimmer border
  if (effectsConfig.shimmerBorder) {
    script += `
  // Add shimmer border to highlighted cards
  gsap.utils.toArray('[data-shimmer]').forEach(el => {
    el.classList.add('shimmer-border');
  });
`;
  }

  // Glassmorphism
  if (effectsConfig.glassmorphism) {
    script += `
  // Apply glassmorphism to cards marked with data-glass
  gsap.utils.toArray('[data-glass]').forEach(el => {
    el.classList.add('glass-card');
  });
`;
  }

  // Always include theme toggle
  script += `
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggle.querySelector('span').textContent = theme === 'dark' ? '🌙' : '☀️';
  }
`;

  // Always include active nav highlight
  script += `
  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id^="section-"]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
`;

  // Close DOMContentLoaded
  script += `
});
`;

  return script;
}
