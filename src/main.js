/* ═══════════════════════════════════════════════════════════
   agents.archi — Main Application Logic (Modularized)
   ═══════════════════════════════════════════════════════════ */

import './style.css';

import { renderThreatGrid } from './data/threats.js';
import { renderLiveFeed } from './components/liveFeed.js';
import { initASLSandbox } from './components/aslSandbox.js';
import { initWaitlistForm } from './components/waitlist.js';
import { initSovereignCouncil } from './components/sovereignCouncil.js';
import { initCertificationPortal } from './components/certificationPortal.js';
import { initLegionSwarm } from './components/legionSwarm.js';
import { loadStripeConfig, initStripeCheckout } from './services/stripe.js';
import { connectTelemetry } from './services/telemetry.js';

import { 
  initNavScroll, 
  initMobileMenu, 
  initSmoothScroll, 
  initActiveNavTracking, 
  initBackToTop, 
  initScrollProgress 
} from './ui/navigation.js';

import { 
  initScrollReveal, 
  animateCounters, 
  initScoreBars, 
  initLabMetrics, 
  initTerminalAnimation, 
  initTypingCursor, 
  initFooterYear 
} from './ui/animations.js';

import { 
  initHeroInteractive, 
  initParticleGrid 
} from './ui/canvas.js';

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  renderThreatGrid();
  initScrollReveal();
  animateCounters();
  initNavScroll();
  initMobileMenu();
  initHeroInteractive();
  initParticleGrid();
  initActiveNavTracking();
  initScrollProgress();
  initSmoothScroll();
  initScoreBars();
  initLabMetrics();
  initTerminalAnimation();
  initWaitlistForm();
  renderLiveFeed();
  loadStripeConfig();
  initStripeCheckout();
  initASLSandbox();
  initBackToTop();
  initTypingCursor();
  initFooterYear();
  initSovereignCouncil();
  initCertificationPortal();
  initLegionSwarm();
  connectTelemetry();
});
