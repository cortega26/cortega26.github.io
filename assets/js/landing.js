const root = document.documentElement;
const particleField = document.querySelector('.particle-field');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let animationFrameId = null;
let particlesActive = false;

const createParticles = () => {
  if (!particleField || particlesActive) {
    return;
  }

  const particleTotal = Math.min(32, Math.max(18, Math.round(window.innerWidth / 45)));

  for (let i = 0; i < particleTotal; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty('--x-offset', `${Math.random() * 40 - 20}vw`);
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;
    particle.style.animationDelay = `${-Math.random() * 8}s`;
    particleField.appendChild(particle);
  }

  particlesActive = true;
};

const clearParticles = () => {
  if (!particleField) {
    return;
  }
  particleField.innerHTML = '';
  particlesActive = false;
};

const animateHueShift = () => {
  let hue = Number.parseFloat(getComputedStyle(root).getPropertyValue('--hue-shift')) || 200;

  const tick = () => {
    hue = (hue + 0.35) % 360;
    root.style.setProperty('--hue-shift', hue.toFixed(2));
    animationFrameId = requestAnimationFrame(tick);
  };

  animationFrameId = requestAnimationFrame(tick);
};

const stopHueShift = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  root.style.removeProperty('--hue-shift');
};

const enableDynamicEffects = () => {
  createParticles();
  animateHueShift();
};

const disableDynamicEffects = () => {
  stopHueShift();
  clearParticles();
};

const updateEffectsForMotionPreference = () => {
  if (prefersReducedMotion.matches) {
    disableDynamicEffects();
  } else {
    enableDynamicEffects();
  }
};

updateEffectsForMotionPreference();

prefersReducedMotion.addEventListener('change', updateEffectsForMotionPreference);

window.addEventListener('resize', () => {
  if (!prefersReducedMotion.matches && particlesActive) {
    clearParticles();
    createParticles();
  }
});
