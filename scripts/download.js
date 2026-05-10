/**
 * Download Page — Animations (Anime.js)
 * Runs alongside main.js which handles canvas, nav, preloader, and scroll reveals.
 * Content is visible by default (no opacity:0 in CSS) so page always renders.
 * JS animations are progressive enhancement only.
 */
(function () {
  'use strict';

  function safeAnime(params) {
    if (typeof anime === 'undefined') return;
    try { anime(params); } catch (e) { /* ignore animation errors */ }
  }

  function initStepReveal() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var steps  = entry.target.querySelectorAll('.dl-step-card');
          var arrows = entry.target.querySelectorAll('.dl-step-arrow');

          safeAnime({
            targets: steps,
            opacity: [0, 1],
            translateY: [24, 0],
            scale: [0.95, 1],
            delay: anime.stagger(140),
            duration: 700,
            easing: 'easeOutBack',
            complete: function () {
              steps.forEach(function (s) { s.classList.add('visible'); });
            }
          });

          safeAnime({
            targets: arrows,
            opacity: [0, 0.35],
            delay: anime.stagger(140, { start: 300 }),
            duration: 400,
            easing: 'easeOutQuad'
          });

          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    var steps = document.getElementById('dl-steps');
    if (steps) obs.observe(steps);
  }

  function initReqReveal() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          safeAnime({
            targets: entry.target.querySelectorAll('.dl-req-card'),
            opacity: [0, 1],
            translateY: [24, 0],
            scale: [0.97, 1],
            delay: anime.stagger(120),
            duration: 650,
            easing: 'easeOutBack'
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    var grid = document.querySelector('.dl-reqs-grid');
    if (grid) obs.observe(grid);
  }

  function initLegacyReveal() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          safeAnime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutExpo'
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    var legacy = document.querySelector('.dl-legacy-card');
    if (legacy) obs.observe(legacy);
  }

  function initDownloadButton() {
    var btn = document.getElementById('dl-windows-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      safeAnime({
        targets: btn.querySelector('svg'),
        translateY: [0, 6, 0],
        duration: 600,
        easing: 'easeOutBounce'
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initStepReveal();
    initReqReveal();
    initLegacyReveal();
    initDownloadButton();
  });

})();

