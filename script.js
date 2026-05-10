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

  if (phone && hero) {
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;
    const heroProg = clamp01(-rect.top / heroH);
    phone.style.setProperty('--scroll', heroProg.toFixed(3));
  }

  if (story && storyTrack) {
    const r = storyTrack.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total > 0 ? clamp01(-r.top / total) : 0;
    story.style.setProperty('--p-spread', clamp01(p / 0.30).toFixed(3));
    story.style.setProperty('--p-hold',   clamp01((p - 0.30) / 0.40).toFixed(3));
    story.style.setProperty('--p-close',  clamp01((p - 0.70) / 0.30).toFixed(3));
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

// ============================================================
//  ORDER FORM — quantity stepper, total, submit, success state
// ============================================================
const orderForm = document.querySelector('.order-form');
const orderSuccess = document.querySelector('.order-success');

if (orderForm) {
  const PRICE = parseInt(orderForm.dataset.price, 10) || 0;
  const totalEl = orderForm.querySelector('[data-total]');
  const qtyInput = orderForm.querySelector('input[name="qty"]');
  const stepperBtns = orderForm.querySelectorAll('.qty-stepper__btn');

  function formatRub(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function updateTotal() {
    let qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 10) qty = 10;
    qtyInput.value = qty;
    if (totalEl) totalEl.textContent = formatRub(qty * PRICE);
  }

  stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = btn.dataset.action === 'inc' ? cur + 1 : cur - 1;
      updateTotal();
    });
  });

  qtyInput.addEventListener('input', updateTotal);
  qtyInput.addEventListener('blur', updateTotal);

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      const firstInvalid = orderForm.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const qty = parseInt(qtyInput.value, 10) || 1;
    const phone = orderForm.elements.phone.value.trim();
    const orderId = 'AP-' + Math.floor(100000 + Math.random() * 900000);
    const total = qty * PRICE;

    if (orderSuccess) {
      orderSuccess.querySelector('[data-success-id]').textContent = orderId;
      orderSuccess.querySelector('[data-success-phone]').textContent = phone;
      orderSuccess.querySelector('[data-success-total]').textContent = formatRub(total);
      orderForm.hidden = true;
      orderSuccess.hidden = false;
      orderSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.querySelector('[data-reset-order]');
  if (resetBtn && orderSuccess) {
    resetBtn.addEventListener('click', () => {
      orderForm.reset();
      updateTotal();
      orderSuccess.hidden = true;
      orderForm.hidden = false;
      orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  updateTotal();
}
