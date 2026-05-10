// ============================================================
//  Headings: split into per-word spans for staggered reveal
// ============================================================
const splits = document.querySelectorAll('[data-split]');
splits.forEach((el) => {
  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.setProperty('--i', i);
    span.textContent = w;
    el.appendChild(span);
  });
});

// ============================================================
//  Reveal-on-scroll
// ============================================================
const animated = document.querySelectorAll(
  '.reveal, .reveal--scale, .reveal--blur, .split'
);

if ('IntersectionObserver' in window && animated.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  animated.forEach((el) => io.observe(el));
} else {
  animated.forEach((el) => el.classList.add('is-in'));
}

// ============================================================
//  Scroll-driven effects: progress bar, hero phone, AirPods story
// ============================================================
const progressFill = document.querySelector('.scroll-progress__fill');
const phone = document.querySelector('.phone');
const hero = document.querySelector('.hero');
const story = document.querySelector('.airpods-story');
const storyTrack = story && story.querySelector('.airpods-story__track');
let ticking = false;

function clamp01(x) { return Math.min(Math.max(x, 0), 1); }

function updateScrollFx() {
  const scrollY = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docH > 0 ? Math.min(scrollY / docH, 1) : 0;

  if (progressFill) progressFill.style.width = (progress * 100) + '%';

  // hero iPhone scroll-tilt
  if (phone && hero) {
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;
    const heroProg = clamp01(-rect.top / heroH);
    phone.style.setProperty('--scroll', heroProg.toFixed(3));
  }

  // AirPods scroll story — three phases driven by progress through the track
  if (story && storyTrack) {
    const r = storyTrack.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total > 0 ? clamp01(-r.top / total) : 0;

    const spread = clamp01(p / 0.30);                 // 0..0.30: buds spread apart
    const hold   = clamp01((p - 0.30) / 0.40);        // 0.30..0.70: specs panel fades in
    const close  = clamp01((p - 0.70) / 0.30);        // 0.70..1.00: buds converge to ears, silhouette rises

    story.style.setProperty('--p-spread', spread.toFixed(3));
    story.style.setProperty('--p-hold',   hold.toFixed(3));
    story.style.setProperty('--p-close',  close.toFixed(3));
  }

  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(updateScrollFx);
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
updateScrollFx();

// ============================================================
//  Color swatches (iPhone buy block)
// ============================================================
const swatches = document.querySelectorAll('.swatch');
swatches.forEach((sw) => {
  sw.addEventListener('click', () => {
    swatches.forEach((s) => {
      s.classList.remove('is-active');
      s.setAttribute('aria-checked', 'false');
    });
    sw.classList.add('is-active');
    sw.setAttribute('aria-checked', 'true');
  });
});

// ============================================================
//  Pointer parallax for the hero iPhone (desktop hover only)
// ============================================================
const supportsHover = window.matchMedia('(hover: hover) and (min-width: 900px)').matches;
if (phone && hero && supportsHover) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    phone.style.setProperty('--scroll', '0');
    phone.style.transform =
      `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
  });
  hero.addEventListener('mouseleave', () => {
    phone.style.transform = '';
  });
}
