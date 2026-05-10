// ============================================================
//  Заголовки: разбиваем на слова, оборачиваем в <span class="word">
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
//  Reveal-on-scroll: универсально для .reveal, .reveal--scale,
//  .reveal--blur и .split (per-word stagger срабатывает по .is-in
//  на самом контейнере)
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
//  Прогресс-бар скролла (мобильный + десктоп)
// ============================================================
const progressFill = document.querySelector('.scroll-progress__fill');
let ticking = false;

function updateScrollFx() {
  const scrollY = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docH > 0 ? Math.min(scrollY / docH, 1) : 0;

  if (progressFill) progressFill.style.width = (progress * 100) + '%';

  // ----- Скролл-связанная анимация iPhone в hero -----
  // var --scroll: 0..1 в пределах hero-секции
  if (phone && hero) {
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;
    // 0 в самом верху, 1 — когда низ hero достиг верха viewport
    const heroProg = Math.min(Math.max(-rect.top / heroH, 0), 1);
    phone.style.setProperty('--scroll', heroProg.toFixed(3));
  }

  ticking = false;
}

const phone = document.querySelector('.phone');
const hero = document.querySelector('.hero');

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
//  Свотчи цвета
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
//  Параллакс-наклон iPhone от курсора (только десктоп с hover)
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
