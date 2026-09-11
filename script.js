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
    grid.innerHTML = `<p class="text-outline col-span-full text-center py-10">No products found or error loading store database.</p>`;
  }
}

function renderGrid(posts) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  if (!posts || posts.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-outline bg-surface-container-low rounded-xl border border-white/5">No products available in the catalog yet. Add some via the Lab Command Center.</div>`;
    return;
  }
  
  grid.innerHTML = posts.map(p => `
    <a href="${p.url}" class="group bg-surface-container-low rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all flex flex-col relative">
      <div class="aspect-video overflow-hidden relative bg-surface-container-highest">
        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105">
        <div class="absolute top-3 right-3 bg-surface-container/90 backdrop-blur text-primary font-bold px-3 py-1 rounded-full text-xs border border-white/10">
          ${p.price}
        </div>
      </div>
      <div class="p-6 space-y-3 flex-1">
        <h3 class="font-display font-bold text-xl text-on-surface group-hover:text-primary transition-colors">${p.name}</h3>
        <p class="text-sm text-outline line-clamp-2">${p.overview ? p.overview.replace(/<[^>]*>?/gm, '') : ''}</p>
      </div>
      <div class="p-6 pt-0 border-t border-white/5 mt-auto flex items-center justify-between text-xs text-outline pt-4">
        <span class="uppercase tracking-widest text-[10px] font-bold text-primary">In Stock</span>
        <span class="text-primary font-bold uppercase tracking-wider group-hover:gap-2 flex items-center transition-all">View Setup <span class="material-symbols-outlined text-sm ml-1">arrow_forward</span></span>
      </div>
    </a>
  `).join('');
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const globalSearch = document.getElementById('global-search-input');
  const sortSelect = document.getElementById('sort-select');

  const filterHandler = () => {
    const term = (searchInput?.value || globalSearch?.value || '').toLowerCase();
    let filtered = allProducts.filter(p => p.name.toLowerCase().includes(term) || (p.overview || '').toLowerCase().includes(term));
    
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
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
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
        <button onclick="removeFromCart('${item.id}')" class="text-outline hover:text-red-400 text-sm">&times;</button>
      </div>
    `).join('');
  }

  if (totalEl) {
    const total = cart.reduce((acc, item) => acc + (parsePrice(item.price) * item.qty), 0);
    totalEl.innerText = `৳${total.toLocaleString()}`;
  }

  document.getElementById('cart-link')?.addEventListener('click', openCart);
  document.getElementById('close-cart')?.addEventListener('click', closeCart);
}

function openCart() { document.getElementById('cart-slider')?.classList.remove('translate-x-full'); }
function closeCart() { document.getElementById('cart-slider')?.classList.add('translate-x-full'); }
window.removeFromCart = (id) => {
  cart = cart.filter(item => item.id !== id);
  saveCart();
};