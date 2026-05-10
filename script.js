// Reveal-on-scroll: ставит класс .is-in, когда элемент попадает в viewport
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && reveals.length) {
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
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

// Переключение цвета (swatch) в блоке "Купить"
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

// Параллакс-наклон CSS-iPhone по движению указателя (только на больших экранах)
const phone = document.querySelector('.phone');
const supportsHover = window.matchMedia('(hover: hover) and (min-width: 900px)').matches;

if (phone && supportsHover) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    phone.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
  });
  hero.addEventListener('mouseleave', () => {
    phone.style.transform = '';
  });
}
