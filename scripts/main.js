/**
 * Project Networks - Enhanced JavaScript
 * Smooth animations, interactions, and performance optimizations
 */

(function($) {
  'use strict';

  // ==========================================
  // Page Loading & Preloader
  // ==========================================
  $(window).on('load', function() {
    $('#js-preloader').addClass('loaded');
  });

  // ==========================================
  // Navigation Scroll Effect
  // ==========================================
  $(window).on('scroll', function() {
    const scroll = $(window).scrollTop();
    
    // Add scrolled class to nav
    if (scroll >= 50) {
      $('.main-nav').addClass('scrolled');
    } else {
      $('.main-nav').removeClass('scrolled');
    }

    // Back to top button visibility
    if (scroll >= 300) {
      $('#backToTop').addClass('visible');
    } else {
      $('#backToTop').removeClass('visible');
    }
  });

  // ==========================================
  // Mobile Menu Toggle
  // ==========================================
  $('.mobile-menu-toggle').on('click', function() {
    $(this).toggleClass('active');
    $('.nav-links').toggleClass('active');
    $('body').toggleClass('menu-open');
  });

  // Close mobile menu when clicking a link
  $('.nav-link').on('click', function() {
    if ($(window).width() < 768) {
      $('.mobile-menu-toggle').removeClass('active');
      $('.nav-links').removeClass('active');
      $('body').removeClass('menu-open');
    }
  });

  // ==========================================
  // Smooth Scrolling for Anchor Links
  // ==========================================
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(event) {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && 
        location.hostname === this.hostname) {
      
      let target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      
      if (target.length) {
        event.preventDefault();
        
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, 800, 'swing');
        
        // Update active nav link
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
      }
    }
  });

  // ==========================================
  // Back to Top Button
  // ==========================================
  $('#backToTop').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 600);
    return false;
  });

  // ==========================================
  // Active Navigation on Scroll
  // ==========================================
  $(window).on('scroll', function() {
    const scrollPos = $(window).scrollTop() + 100;

    $('section[id]').each(function() {
      const section = $(this);
      const sectionTop = section.offset().top;
      const sectionBottom = sectionTop + section.outerHeight();
      const sectionId = section.attr('id');

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        $('.nav-link').removeClass('active');
        $('.nav-link[href="#' + sectionId + '"]').addClass('active');
      }
    });
  });

  // ==========================================
  // Lazy Loading Images
  // ==========================================
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ==========================================
  // Gradient Orb Mouse Follow Effect
  // ==========================================
  let mouseX = 0, mouseY = 0;
  let orb3X = 0, orb3Y = 0;

  $(document).on('mousemove', function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  function animateOrb() {
    // Smooth following effect
    orb3X += (mouseX - orb3X) * 0.05;
    orb3Y += (mouseY - orb3Y) * 0.05;

    if ($('.orb-3').length) {
      $('.orb-3').css({
        left: orb3X + 'px',
        top: orb3Y + 'px'
      });
    }

    requestAnimationFrame(animateOrb);
  }

  animateOrb();

  // ==========================================
  // Button Ripple Effect
  // ==========================================
  $('.btn').on('click', function(e) {
    const button = $(this);
    const ripple = $('<span class="ripple"></span>');
    
    const diameter = Math.max(button.outerWidth(), button.outerHeight());
    const radius = diameter / 2;
    
    ripple.css({
      width: diameter,
      height: diameter,
      left: e.pageX - button.offset().left - radius,
      top: e.pageY - button.offset().top - radius
    });
    
    button.append(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });

  // Add CSS for ripple effect
  const rippleStyles = `
    <style>
      .btn { position: relative; overflow: hidden; }
      .btn .ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    </style>
  `;
  $('head').append(rippleStyles);

  // ==========================================
  // Card Tilt Effect (3D)
  // ==========================================
  $('.project-card').on('mousemove', function(e) {
    const card = $(this);
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.css({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`
    });
  });

  $('.project-card').on('mouseleave', function() {
    $(this).css({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)'
    });
  });

  // ==========================================
  // Parallax Effect on Scroll
  // ==========================================
  $(window).on('scroll', function() {
    const scrolled = $(window).scrollTop();
    
    $('.hero-content').css({
      transform: `translateY(${scrolled * 0.3}px)`,
      opacity: 1 - (scrolled / 500)
    });
  });

  // ==========================================
  // Count Up Animation
  // ==========================================
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      if (typeof end === 'string') {
        element.textContent = end;
      } else {
        element.textContent = Math.floor(progress * (end - start) + start);
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Trigger count animation when stats come into view
  if ('IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const value = entry.target.textContent.trim();
          animateValue(entry.target, 0, value, 2000);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-value').forEach(stat => {
      statsObserver.observe(stat);
    });
  }

  // ==========================================
  // Copy to Clipboard Functionality
  // ==========================================
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  }

  // ==========================================
  // Notification System
  // ==========================================
  function showNotification(message, type = 'success') {
    const notification = $(`
      <div class="notification notification-${type}">
        <span>${message}</span>
      </div>
    `);

    $('body').append(notification);

    setTimeout(() => notification.addClass('show'), 100);
    setTimeout(() => {
      notification.removeClass('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add notification styles
  const notificationStyles = `
    <style>
      .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: rgba(18, 18, 26, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }
      .notification-success {
        border-left: 3px solid #4ade80;
      }
      .notification-error {
        border-left: 3px solid #ef4444;
      }
      .notification-info {
        border-left: 3px solid #3b82f6;
      }
      @media (max-width: 576px) {
        .notification {
          left: 20px;
          right: 20px;
          transform: translateY(-100px);
        }
        .notification.show {
          transform: translateY(0);
        }
      }
    </style>
  `;
  $('head').append(notificationStyles);

  // ==========================================
  // Performance: Debounce Function
  // ==========================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Apply debounce to resize events
  $(window).on('resize', debounce(function() {
    // Recalculate any layout-dependent features
    console.log('Window resized');
  }, 250));

  // ==========================================
  // Accessibility: Focus Trap for Mobile Menu
  // ==========================================
  const focusableElements = 'a[href], button, textarea, input, select';
  
  $('.mobile-menu-toggle').on('click', function() {
    if ($('.nav-links').hasClass('active')) {
      const focusable = $('.nav-links').find(focusableElements).filter(':visible');
      if (focusable.length) focusable.first().focus();
    }
  });

  // ==========================================
  // Enhanced Error Handling
  // ==========================================
  window.addEventListener('error', function(e) {
    console.error('Error caught:', e.error);
  });

  // ==========================================
  // Initialize on Document Ready
  // ==========================================
  $(document).ready(function() {
    console.log('Project Networks - Enhanced version loaded');
    
    // Add loaded class to body for CSS animations
    $('body').addClass('page-loaded');
  });

})(jQuery);
