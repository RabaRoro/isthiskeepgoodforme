let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
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
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-outline bg-surface-container-low rounded-xl border border-white/5">No products available in the catalog yet.</div>`;
    return;
  }
  
  grid.innerHTML = posts.map(p => `
    <div class="group relative bg-surface-container-low rounded-xl overflow-hidden transition-all duration-500 hover:translate-y-[-8px] border border-white/5">
      <div class="aspect-[4/5] bg-surface-container-lowest relative overflow-hidden">
        <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" src="${p.image}" alt="${p.name}"/>
        ${p.isHot ? `<div class="absolute top-4 left-4"><span class="bg-primary text-on-primary-fixed text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">Hot Deal</span></div>` : ''}
      </div>
      <div class="p-6">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-bold tracking-tight text-white">${p.name}</h3>
          <span class="text-primary font-mono font-bold">${p.price}</span>
        </div>
        <p class="text-sm text-outline mb-6 line-clamp-2">${p.overview ? p.overview.replace(/<[^>]*>?/gm, '') : ''}</p>
        <a href="${p.url}" class="inline-flex items-center gap-2 bg-surface-container-highest hover:bg-primary hover:text-on-primary-fixed transition-all text-xs font-bold px-4 py-2 rounded-xl text-primary">
          View Setup <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
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