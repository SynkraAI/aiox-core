/**
 * Vanilla JavaScript for branded web HTML output.
 * IntersectionObserver animations, theme toggle, sticky nav, scroll progress, back-to-top.
 */

/**
 * @param {{ animations: string, features: string }} options - User-selected options
 * @returns {string} Complete JS string wrapped in DOMContentLoaded
 */
export function getWebJS(options = {}) {
  const { animations = 'full', features = 'full' } = options;

  const hasScrollAnimations = ['scroll', 'full'].includes(animations) || animations === 'minimal';
  const hasDarkLight = ['toggle', 'full'].includes(features);
  const hasStickyNav = ['nav', 'full'].includes(features);
  const hasProgressBar = features === 'full';
  const hasBackToTop = features === 'full';

  const blocks = [];

  blocks.push(`'use strict';`);
  blocks.push(`document.addEventListener('DOMContentLoaded', function() {`);

  // Scroll animations via IntersectionObserver
  if (hasScrollAnimations) {
    blocks.push(`
  // Scroll animations
  var animatedEls = document.querySelectorAll('.animate-on-scroll');
  if (animatedEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animatedEls.forEach(function(el) { observer.observe(el); });
  } else {
    animatedEls.forEach(function(el) { el.classList.add('visible'); });
  }
`);
  }

  // Dark/light theme toggle
  if (hasDarkLight) {
    blocks.push(`
  // Theme toggle
  var toggle = document.querySelector('.theme-toggle');
  var saved = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  if (toggle) toggle.textContent = saved === 'light' ? '\\u2600' : '\\u263E';
  if (toggle) {
    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'light' ? '\\u2600' : '\\u263E';
    });
  }
`);
  }

  // Sticky nav — active section highlight
  if (hasStickyNav) {
    blocks.push(`
  // Sticky nav — active section highlight
  var navLinks = document.querySelectorAll('.site-nav-links a');
  var sections = document.querySelectorAll('.doc-section[id]');
  if (navLinks.length && sections.length) {
    var navObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(function(s) { navObserver.observe(s); });
  }
`);
  }

  // Unified scroll listener for progress bar + back-to-top
  if (hasProgressBar || hasBackToTop) {
    blocks.push(`
  // Scroll: progress bar + back-to-top (single listener)
  var progressBar = ${hasProgressBar ? "document.querySelector('.progress-bar')" : 'null'};
  var backToTop = ${hasBackToTop ? "document.querySelector('.back-to-top')" : 'null'};
  if (progressBar || backToTop) {
    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY;${hasProgressBar ? `
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar && docHeight > 0) {
        progressBar.style.width = (scrollTop / docHeight) * 100 + '%';
      }` : ''}${hasBackToTop ? `
      if (backToTop) {
        if (scrollTop > 400) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }` : ''}
    }, { passive: true });${hasBackToTop ? `
    if (backToTop) {
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }` : ''}
  }
`);
  }

  blocks.push(`});`);

  return blocks.join('\n');
}
