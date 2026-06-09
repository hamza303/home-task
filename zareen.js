/* ============================================================
   ZAREEN — interactions
   ============================================================ */
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- nav scroll state ---- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- scroll reveal (IO + robust fallbacks) ---- */
  function show(el) {
    if (el.classList.contains('in')) return;
    const sibs = $$('.reveal', el.parentElement);
    const sib = sibs.indexOf(el);
    el.style.transitionDelay = Math.min(sib < 0 ? 0 : sib, 4) * 90 + 'ms';
    el.classList.add('in');
  }
  const reveals = $$('.reveal');
  // reveal anything already within (or near) the viewport — covers first paint
  function revealInView() {
    const vh = window.innerHeight || 800;
    reveals.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) show(el);
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach(show);
  }
  revealInView();
  requestAnimationFrame(revealInView);
  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('load', revealInView);
  // ultimate safety net: never leave content invisible
  setTimeout(() => reveals.forEach(show), 1600);

  /* ---- product state ---- */
  const PRICE = 285;
  const state = { color: 'Sand', size: null };

  // colour swatches
  const colorVal = $('#colorVal');
  const swatchNote = $('#swatchNote');
  $$('#swatches .swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      $$('#swatches .swatch').forEach((s) => s.setAttribute('aria-checked', 'false'));
      sw.setAttribute('aria-checked', 'true');
      state.color = sw.dataset.name;
      colorVal.textContent = state.color;
      swatchNote.textContent = 'Colour — ' + state.color;
    });
  });

  // sizes
  const sizeVal = $('#sizeVal');
  $$('#sizes .size').forEach((sz) => {
    sz.addEventListener('click', () => {
      if (sz.disabled) return;
      $$('#sizes .size').forEach((s) => s.setAttribute('aria-checked', 'false'));
      sz.setAttribute('aria-checked', 'true');
      state.size = sz.textContent.trim();
      sizeVal.textContent = state.size;
      sizeVal.style.color = 'var(--ink)';
    });
  });

  /* ---- cart ---- */
  const cart = [];
  const cartCount = $('#cartCount');
  const cartItems = $('#cartItems');
  const cartTotal = $('#cartTotal');
  const drawer = $('#drawer');
  const scrim = $('#scrim');

  const swatchHex = {
    Sand: '#DDD1BC', Clay: '#C2AC8C', Cream: '#EFE9DD', Umber: '#5B5043', Espresso: '#2A2620'
  };

  function openCart() { drawer.classList.add('open'); scrim.classList.add('open'); }
  function closeCart() { drawer.classList.remove('open'); scrim.classList.remove('open'); }

  function renderCart() {
    cartCount.textContent = cart.length;
    cartCount.classList.remove('bump');
    void cartCount.offsetWidth;
    cartCount.classList.add('bump');

    if (!cart.length) {
      cartItems.innerHTML = '<p class="drawer__empty">Your cart is quiet for now.<br>The Atelier Hoodie is waiting.</p>';
    } else {
      cartItems.innerHTML = cart.map((it, i) => `
        <div class="citem">
          <div class="citem__thumb" style="--c:${swatchHex[it.color] || '#DDD1BC'}"></div>
          <div>
            <div class="citem__name">The Atelier Hoodie</div>
            <div class="citem__meta">${it.color} · Size ${it.size}</div>
            <button class="citem__rm" data-i="${i}">Remove</button>
          </div>
          <div class="citem__price">£${it.price}</div>
        </div>`).join('');
      $$('.citem__rm', cartItems).forEach((b) =>
        b.addEventListener('click', () => { cart.splice(+b.dataset.i, 1); renderCart(); }));
    }
    cartTotal.textContent = '£' + cart.reduce((s, it) => s + it.price, 0);
  }

  // add to cart
  const addBtn = $('#addBtn');
  addBtn.addEventListener('click', () => {
    if (!state.size) {
      // nudge user to pick a size
      sizeVal.textContent = 'Please select a size';
      sizeVal.style.color = 'var(--gold)';
      const sizes = $('#sizes');
      sizes.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
         { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
        { duration: 320, easing: 'ease-in-out' });
      return;
    }
    cart.push({ color: state.color, size: state.size, price: PRICE });
    renderCart();
    addBtn.classList.add('done');
    setTimeout(() => addBtn.classList.remove('done'), 1700);
    setTimeout(openCart, 420);
  });

  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  /* ---- newsletter ---- */
  const form = $('#signupForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#signupBtn');
    btn.textContent = 'Thank you';
    form.querySelector('input').value = '';
    form.querySelector('input').placeholder = "You're on the list";
    setTimeout(() => { btn.textContent = 'Join'; }, 2600);
  });
})();
