/**
 * OPCODE – Open Platform Community of Design Engineers
 * Frontend Controller & Interactive PCB Gallery Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Element References ---
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const featuredPcbImage = document.getElementById('featuredPcbImage');
  const thumbnails = document.querySelectorAll('.pcb-thumbnail');
  const overlays = document.querySelectorAll('.pcb-overlay');

  /* ------------------------------------------------------------------------
     1. Header Scroll Dynamics
     ------------------------------------------------------------------------ */
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ------------------------------------------------------------------------
     2. Responsive Mobile Navigation Toggle
     ------------------------------------------------------------------------ */
  const toggleMobileMenu = (forceClose = false) => {
    const isCurrentlyOpen = mobileMenuBtn.classList.contains('open');
    const shouldOpen = forceClose ? false : !isCurrentlyOpen;

    if (shouldOpen) {
      mobileMenuBtn.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      mobileNav.removeAttribute('hidden');
    } else {
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('hidden', '');
    }
  };

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.forEach((l) => l.classList.remove('active'));
        const href = link.getAttribute('href');
        document.querySelectorAll(`a[href="${href}"]`).forEach((matched) => {
          matched.classList.add('active');
        });
        toggleMobileMenu(true);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuBtn.classList.contains('open')) {
        toggleMobileMenu(true);
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mobileMenuBtn.classList.contains('open') &&
        !header.contains(e.target)
      ) {
        toggleMobileMenu(true);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. Interactive 3-Image PCB Gallery Controller
     - Switches featured image smoothly with crossfade
     - Activates matching SVG spark overlay with independent circuit paths
     - Updates active thumbnail cyan border highlight
     ------------------------------------------------------------------------ */
  let isSwitching = false;

  const switchPcbImage = (selectedThumb) => {
    if (!selectedThumb || selectedThumb.classList.contains('active') || isSwitching) {
      return;
    }

    isSwitching = true;
    const targetImageSrc = selectedThumb.getAttribute('data-image');
    const targetOverlayId = selectedThumb.getAttribute('data-overlay');
    const targetOverlay = document.getElementById(targetOverlayId);

    // Update thumbnail highlights
    thumbnails.forEach((thumb) => {
      thumb.classList.remove('active');
      thumb.setAttribute('aria-selected', 'false');
    });
    selectedThumb.classList.add('active');
    selectedThumb.setAttribute('aria-selected', 'true');

    // Fade out main image smoothly
    if (featuredPcbImage) {
      featuredPcbImage.classList.add('fade-out');
    }

    // Crossfade SVG spark overlays
    overlays.forEach((overlay) => {
      overlay.classList.remove('active');
    });

    setTimeout(() => {
      if (featuredPcbImage && targetImageSrc) {
        featuredPcbImage.src = targetImageSrc;
        
        // When new image is ready, fade back in
        const handleImageLoad = () => {
          featuredPcbImage.classList.remove('fade-out');
          if (targetOverlay) {
            targetOverlay.classList.add('active');
          }
          isSwitching = false;
          featuredPcbImage.removeEventListener('load', handleImageLoad);
        };

        if (featuredPcbImage.complete) {
          handleImageLoad();
        } else {
          featuredPcbImage.addEventListener('load', handleImageLoad);
          // Fallback timeout in case of caching or fast load
          setTimeout(handleImageLoad, 200);
        }
      } else {
        if (targetOverlay) {
          targetOverlay.classList.add('active');
        }
        isSwitching = false;
      }
    }, 160);
  };

  // Attach click and keyboard events to thumbnails
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => switchPcbImage(thumb));

    // Keyboard navigation (Arrow keys left/right)
    thumb.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (index + 1) % thumbnails.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (index - 1 + thumbnails.length) % thumbnails.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        thumbnails[targetIndex].focus();
        switchPcbImage(thumbnails[targetIndex]);
      }
    });
  });

  /* ------------------------------------------------------------------------
     4. Interactive 3D Perspective Tilt on Featured PCB Frame
     - Responds smoothly to cursor position
     - Gentle, subtle perspective rotation (max ±5.5-6.5 deg)
     - Dynamic realistic soft shadow offset
     - Smoothly returns to neutral position on pointer leave
     - Touch support on mobile without interfering with vertical scroll
     ------------------------------------------------------------------------ */
  const featuredFrame = document.querySelector('.pcb-featured-frame');

  if (featuredFrame && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let isInteracting = false;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let rafId = null;

    const renderTiltLoop = () => {
      // Linear interpolation (lerp) for smooth fluid motion
      currentRotateX += (targetRotateX - currentRotateX) * 0.14;
      currentRotateY += (targetRotateY - currentRotateY) * 0.14;

      const shadowX = -currentRotateY * 1.8;
      const shadowY = currentRotateX * 1.8 + 22;

      featuredFrame.style.transform = `perspective(1100px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
      featuredFrame.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 42px rgba(0, 0, 0, 0.72), 0 0 20px rgba(0, 240, 255, 0.08)`;

      if (isInteracting || Math.abs(targetRotateX - currentRotateX) > 0.04 || Math.abs(targetRotateY - currentRotateY) > 0.04) {
        rafId = requestAnimationFrame(renderTiltLoop);
      } else {
        featuredFrame.style.transform = '';
        featuredFrame.style.boxShadow = '';
        rafId = null;
      }
    };

    const handlePointerMove = (clientX, clientY) => {
      const rect = featuredFrame.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Normalize coordinates (-1 to 1)
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      // Subtle, controlled angles to prevent excessive distortion
      targetRotateX = -normY * 5.5;
      targetRotateY = normX * 6.5;

      if (!rafId) {
        rafId = requestAnimationFrame(renderTiltLoop);
      }
    };

    featuredFrame.addEventListener('mouseenter', () => {
      isInteracting = true;
      featuredFrame.style.transition = 'none';
      if (!rafId) {
        rafId = requestAnimationFrame(renderTiltLoop);
      }
    });

    featuredFrame.addEventListener('mousemove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    });

    featuredFrame.addEventListener('mouseleave', () => {
      isInteracting = false;
      targetRotateX = 0;
      targetRotateY = 0;
      featuredFrame.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease';
    });

    // Passive touch interaction that does not block native vertical scrolling
    featuredFrame.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isInteracting = true;
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    featuredFrame.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    featuredFrame.addEventListener('touchend', () => {
      isInteracting = false;
      targetRotateX = 0;
      targetRotateY = 0;
      featuredFrame.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease';
    });

    featuredFrame.addEventListener('touchcancel', () => {
      isInteracting = false;
      targetRotateX = 0;
      targetRotateY = 0;
      featuredFrame.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease';
    });
  }

  /* ------------------------------------------------------------------------
     5. Circuit Path Calibration
     Measures SVG trace lengths across all active overlays
     ------------------------------------------------------------------------ */
  const calibrateAllCircuitTraces = () => {
    const traces = document.querySelectorAll('.pcb-circuit-svg defs path');
    traces.forEach((trace) => {
      if (typeof trace.getTotalLength === 'function') {
        const length = Math.ceil(trace.getTotalLength());
        trace.dataset.length = length;
      }
    });
  };

  calibrateAllCircuitTraces();

  /* ------------------------------------------------------------------------
     6. Page Visibility Optimization
     Pauses animations when user switches browser tabs to preserve CPU
     ------------------------------------------------------------------------ */
  document.addEventListener('visibilitychange', () => {
    const activeSvg = document.querySelector('.pcb-circuit-svg.active');
    if (!activeSvg) return;

    if (document.hidden) {
      activeSvg.style.animationPlayState = 'paused';
    } else {
      activeSvg.style.animationPlayState = 'running';
    }
  });
});
