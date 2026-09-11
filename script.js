let allProducts = [];
let cart = JSON.parse(localStorage.getItem('geek_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  initCartUI();
  
  if (document.getElementById('products-grid')) {
    loadProducts();
    setupFilters();
  }
});

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  try {
    const res = await fetch('products.json');
    allProducts = await res.json();
    renderGrid(allProducts);
  } catch (err) {
    grid.innerHTML = `<p class="text-slate-400">No products found or error loading store database.</p>`;
  }
}

function renderGrid(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  grid.innerHTML = products.map(p => `
    <div class="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all flex flex-col justify-between">
      <a href="${p.url}">
        <div class="aspect-[4/5] overflow-hidden">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
        </div>
        <div class="p-6 space-y-2">
          <h3 class="font-bold text-lg text-on-surface">${p.name}</h3>
          <p class="text-primary font-bold">${p.price}</p>
          <p class="text-xs text-on-surface-variant line-clamp-2">${p.meta}</p>
        </div>
      </a>
      <div class="p-6 pt-0">
        <button onclick="addToCart('${p.id}', '${p.name}', '${p.price}', '${p.image}')" class="w-full py-2 bg-surface-variant hover:bg-primary hover:text-on-primary-fixed text-xs font-bold rounded-lg transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const globalSearch = document.getElementById('global-search-input');
  const sortSelect = document.getElementById('sort-select');

  const filterHandler = () => {
    const term = (searchInput?.value || globalSearch?.value || '').toLowerCase();
    let filtered = allProducts.filter(p => p.name.toLowerCase().includes(term) || p.meta.toLowerCase().includes(term));
    
    if (sortSelect?.value === 'price-low') {
      filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortSelect?.value === 'price-high') {
      filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }
    renderGrid(filtered);
  };

  searchInput?.addEventListener('input', filterHandler);
  globalSearch?.addEventListener('input', filterHandler);
  sortSelect?.addEventListener('change', filterHandler);
}

function parsePrice(str) {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

// Shopping Cart Functions
window.addToCart = (id, name, price, image) => {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, image, qty: 1 });
  
  saveCart();
  openCart();
};

function saveCart() {
  localStorage.setItem('geek_cart', JSON.stringify(cart));
  initCartUI();
}

function initCartUI() {
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  
  if (countEl) countEl.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
  
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-white/5">
        <div class="flex items-center gap-3">
          <img src="${item.image}" class="w-12 h-12 rounded object-cover">
          <div>
            <h4 class="text-xs font-bold text-on-surface">${item.name}</h4>
            <span class="text-xs text-primary">${item.price} x ${item.qty}</span>
          </div>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="text-slate-500 hover:text-red-400 text-sm">&times;</button>
      </div>
    `).join('');
  }

  if (totalEl) {
    const total = cart.reduce((acc, item) => acc + (parsePrice(item.price) * item.qty), 0);
    totalEl.innerText = `৳${total.toLocaleString()}`;
  }

  // Cart open/close triggers
  document.getElementById('cart-link')?.addEventListener('click', openCart);
  document.getElementById('close-cart')?.addEventListener('click', closeCart);
}

function openCart() { document.getElementById('cart-slider')?.classList.remove('translate-x-full'); }
function closeCart() { document.getElementById('cart-slider')?.classList.add('translate-x-full'); }
window.removeFromCart = (id) => {
  cart = cart.filter(item => item.id !== id);
  saveCart();
};