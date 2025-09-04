const Storage = {
  getCart: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  setCart: (c) => localStorage.setItem('cart', JSON.stringify(c))
};

async function loadJSON(path) {
  const r = await fetch(path);
  return r.json();
}

function formatPrice(num){
  return Number(num).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م.‏';
}

function setCartBadge(){
  const count = Storage.getCart().reduce((s,i)=>s+i.quantity,0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

function addToCart(item){
  const cart = Storage.getCart();
  const key = `${item.id}|${item.colorName}`;
  const idx = cart.findIndex(x => `${x.id}|${x.colorName}` === key);
  if(idx > -1){ cart[idx].quantity += item.quantity; } else { cart.push(item); }
  Storage.setCart(cart); setCartBadge();
  showToast('تمت الإضافة للسلة 🎉');
}

function pickRelated(all, current){
  const pool = all.filter(p => p.category === current.category && p.id !== current.id);
  return pool.sort(()=>0.5 - Math.random()).slice(0,3);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}

async function init() {
  const settings = await loadJSON('./settings.json');
  document.querySelectorAll('#whatsapp-float').forEach(el => {
    el.href = `https://wa.me/${settings.whatsapp}`;
  });

  // Update contact page with settings
  if (window.location.pathname.split('/').pop() === 'contact.html') {
    document.getElementById('phone1').href = `tel:${settings.phone1}`;
    document.getElementById('phone1').textContent = settings.phone1;
    document.getElementById('phone2').href = `tel:${settings.phone2}`;
    document.getElementById('phone2').textContent = settings.phone2;
    document.getElementById('whatsapp').href = `https://wa.me/${settings.whatsapp}`;
    document.getElementById('facebook').href = settings.facebook;
    document.getElementById('instagram').href = settings.instagram;
  }

  setCartBadge();

  const path = window.location.pathname.split('/').pop();

  if (path === 'index.html' || path === '') {
    const categories = await loadJSON('./categories.json');
    const grid = document.getElementById('categories-grid');
    categories.forEach(cat => {
      const card = document.createElement('a');
      card.href = `menu.html?category=${cat.id}`;
      card.className = 'card rounded-2xl shadow-md bg-white p-4 hover:shadow-lg transition-all duration-300';
      card.innerHTML = `
        <img src="${cat.image}" alt="${cat.name}" loading="lazy" class="w-full h-40 object-cover rounded-xl mb-2">
        <h4 class="font-bold mb-1">${cat.name}</h4>
      `;
      grid.appendChild(card);
    });

    document.getElementById('hero-title').textContent = settings.hero.title;
    document.getElementById('hero-subtitle').textContent = settings.hero.subtitle;
    document.getElementById('hero-cta').textContent = settings.hero.cta;
  } else if (path === 'menu.html') {
    const categories = await loadJSON('./categories.json');
    const products = await loadJSON('./products.json');
    const filterContainer = document.getElementById('category-filters');
    const selectedCategory = sessionStorage.getItem('selectedCategory') || getQueryParam('category') || 'all';

    const allChip = document.createElement('button');
    allChip.className = `px-3 py-1 rounded-full border text-sm transition-all duration-300 ${selectedCategory === 'all' ? 'bg-primary text-white border-transparent' : ''}`;
    allChip.textContent = 'الكل';
    allChip.addEventListener('click', () => {
      sessionStorage.setItem('selectedCategory', 'all');
      filterProducts(products, 'all');
      updateSelectedChip(allChip);
    });
    filterContainer.appendChild(allChip);

    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `px-3 py-1 rounded-full border text-sm transition-all duration-300 ${selectedCategory === cat.id ? 'bg-primary text-white border-transparent' : ''}`;
      chip.textContent = cat.name;
      chip.dataset.id = cat.id;
      chip.addEventListener('click', () => {
        sessionStorage.setItem('selectedCategory', cat.id);
        filterProducts(products, cat.id);
        updateSelectedChip(chip);
      });
      filterContainer.appendChild(chip);
    });

    function updateSelectedChip(selected) {
      filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('bg-primary', 'text-white', 'border-transparent'));
      selected.classList.add('bg-primary', 'text-white', 'border-transparent');
    }

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => filterProducts(products, selectedCategory));

    function filterProducts(allProducts, cat) {
      const query = searchInput.value.toLowerCase();
      const filtered = allProducts.filter(p => {
        const matchesCategory = cat === 'all' ? true : p.category === cat;
        const matchesSearch = p.name.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
      renderProducts(filtered);
    }

  function renderProducts(prods) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  if (prods.length === 0) {
    document.getElementById('no-results').classList.remove('hidden');
    return;
  }
  document.getElementById('no-results').classList.add('hidden');
  prods.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card rounded-2xl shadow-md bg-white p-4 hover:shadow-lg transition-all duration-300 cursor-pointer';
    card.innerHTML = `
      <img src="${p.colors[0].images[0]}" alt="${p.name}" loading="lazy" class="w-full h-40 object-cover rounded-xl mb-2">
      <h4 class="font-bold mb-1">${p.name}</h4>
      <!-- 
      <div class="flex flex-row flex-wrap gap-1 mb-2">
        ${p.colors.map(c => `<div class="w-4 h-4 rounded-full" style="background-color: ${c.code};"></div>`).join('')}
      </div>
      -->
      <p class="text-primary font-bold">${formatPrice(p.price)}</p>
      <div class="flex flex-col md:flex-row gap-2 mt-4">
        <button class="details bg-secondary text-white rounded-2xl px-3 py-1 text-sm font-bold flex-1 transition-all duration-300" data-id="${p.id}">عرض التفاصيل</button>
        <button class="add-cart bg-primary text-white rounded-2xl px-3 py-1 text-sm font-bold flex-1 transition-all duration-300" data-id="${p.id}" data-has-colors="${p.colors.length > 1}">إضافة للسلة</button>
      </div>
    `;
        card.addEventListener('click', (e) => {
          if (!e.target.classList.contains('add-cart') && !e.target.classList.contains('details')) {
            window.location.href = `product.html?id=${p.id}`;
          }
        });
        grid.appendChild(card);
      });
      document.querySelectorAll('.details').forEach(btn => {
        btn.addEventListener('click', () => window.location.href = `product.html?id=${btn.dataset.id}`);
      });
      document.querySelectorAll('.add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.hasColors === 'true') {
            showToast('برجاء اختيار اللون');
            window.location.href = `product.html?id=${btn.dataset.id}`;
          } else {
            const product = products.find(p => p.id == btn.dataset.id);
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              colorName: product.colors[0].name,
              colorCode: product.colors[0].code,
              image: product.colors[0].images[0],
              quantity: 1
            });
          }
        });
      });
    }

    filterProducts(products, selectedCategory);
  } else if (path === 'product.html') {
    const id = parseInt(getQueryParam('id'));
    if (!id) return;
    const products = await loadJSON('./products.json');
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.title = `PARTY - ${product.name}`;
    document.querySelector('meta[name="description"]').content = product.description;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-description').textContent = product.description;

    let selectedColorIndex = -1; // -1 for 'all'
    const swatches = document.getElementById('color-swatches');
    const allButton = document.createElement('button');
    allButton.className = 'w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all duration-300 ring-primary';
    allButton.innerHTML = '<span class="text-sm">الكل</span>';
    allButton.addEventListener('click', () => {
      selectedColorIndex = -1;
      updateGallery();
      swatches.querySelectorAll('button').forEach(b => b.classList.replace('ring-primary', 'ring-transparent'));
      allButton.classList.replace('ring-transparent', 'ring-primary');
    });
    swatches.appendChild(allButton);

    product.colors.forEach((color, index) => {
      const button = document.createElement('button');
      button.className = `w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all duration-300 ring-transparent`;
      button.style.backgroundColor = color.code;
      button.ariaLabel = color.name;
      button.addEventListener('click', () => {
        selectedColorIndex = index;
        updateGallery();
        swatches.querySelectorAll('button').forEach(b => b.classList.replace('ring-primary', 'ring-transparent'));
        button.classList.replace('ring-transparent', 'ring-primary');
      });
      swatches.appendChild(button);
    });

    const mainImage = document.getElementById('main-image');
    const thumbnails = document.getElementById('thumbnails');
    function updateGallery() {
      let images = [];
      if (selectedColorIndex === -1) {
        product.colors.forEach(color => images = images.concat(color.images));
      } else {
        images = product.colors[selectedColorIndex].images;
      }
      mainImage.src = images[0];
      thumbnails.innerHTML = '';
      images.forEach((img, idx) => {
        const thumb = document.createElement('img');
        thumb.src = img;
        thumb.alt = '';
        thumb.className = `w-20 h-20 rounded-xl object-cover border cursor-pointer transition-all duration-300 ${idx === 0 ? 'border-primary' : 'border-transparent'}`;
        thumb.addEventListener('click', () => {
          mainImage.src = img;
          thumbnails.querySelectorAll('img').forEach(t => t.classList.replace('border-primary', 'border-transparent'));
          thumb.classList.replace('border-transparent', 'border-primary');
        });
        thumbnails.appendChild(thumb);
      });
    }
    updateGallery();

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    mainImage.addEventListener('click', () => {
      lightboxImage.src = mainImage.src;
      lightbox.classList.remove('hidden');
    });
    lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.add('hidden');
    });

    // Add to cart
    document.getElementById('add-to-cart').addEventListener('click', () => {
      if (selectedColorIndex === -1) {
        showToast('برجاء اختيار اللون');
        return;
      }
      const color = product.colors[selectedColorIndex];
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        colorName: color.name,
        colorCode: color.code,
        image: color.images[0],
        quantity: 1
      });
    });

    // Related
    const related = pickRelated(products, product);
    const relatedGrid = document.getElementById('related-products');
    related.forEach(p => {
      const card = document.createElement('a');
      card.href = `product.html?id=${p.id}`;
      card.className = 'card rounded-2xl shadow-md bg-white p-4 hover:shadow-lg transition-all duration-300';
      card.innerHTML = `
        <img src="${p.colors[0].images[0]}" alt="${p.name}" loading="lazy" class="w-full h-40 object-cover rounded-xl mb-2">
        <h4 class="font-bold mb-1">${p.name}</h4>
        <p class="text-primary font-bold">${formatPrice(p.price)}</p>
      `;
      relatedGrid.appendChild(card);
    });
  } else if (path === 'cart.html') {
    const cart = Storage.getCart();
    const itemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const grandTotal = document.getElementById('grand-total');
    itemsContainer.innerHTML = ''; // Clear before rendering
    if (cart.length === 0) {
      emptyCart.classList.remove('hidden');
    } else {
      emptyCart.classList.add('hidden');
      let total = 0;
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'flex gap-4 border-b pb-4 animate-fade-in';
        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover">
          <div class="flex-1">
            <h4 class="font-bold">${item.name}</h4>
            <div class="flex items-center gap-2 text-sm text-textsecondary">
              <span>اللون:</span>
              <div class="w-4 h-4 rounded-full" style="background-color: ${item.colorCode};"></div>
              <span>${item.colorName}</span>
            </div>
            <p class="text-primary font-bold">${formatPrice(item.price)}</p>
            <div class="flex items-center gap-2 mt-2">
              <button class="decrease bg-neutral text-textprimary px-2 py-1 rounded transition-all duration-300">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="increase bg-neutral text-textprimary px-2 py-1 rounded transition-all duration-300">+</button>
              <button class="remove text-red-500 text-sm">إزالة</button>
            </div>
          </div>
        `;
        div.querySelector('.decrease').addEventListener('click', () => {
          if (item.quantity > 1) {
            item.quantity--;
            updateCart();
          }
        });
        div.querySelector('.increase').addEventListener('click', () => {
          item.quantity++;
          updateCart();
        });
        div.querySelector('.remove').addEventListener('click', () => {
          cart.splice(index, 1);
          Storage.setCart(cart);
          init();
        });
        itemsContainer.appendChild(div);
      });
      grandTotal.textContent = formatPrice(total);
    }

    function updateCart() {
      Storage.setCart(cart);
      setCartBadge();
      init();
    }

    document.getElementById('customer-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('customer-name').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const address = document.getElementById('customer-address').value.trim();
      const notes = document.getElementById('customer-notes').value.trim();

      if (!name || phone.length < 10 || phone.length > 15 || !address) {
        showToast('يرجى ملء جميع الحقول المطلوبة بشكل صحيح.');
        return;
      }

      let message = 'طلب جديد من PARTY!🛒\n\nالمنتجات:\n';
      let total = 0;
      cart.forEach((item, i) => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        message += `${i + 1}) ${item.name} - اللون: ${item.colorName} - العدد: ${item.quantity} - ${formatPrice(lineTotal)}\n`;
      });
      message += `\nالإجمالي: ${formatPrice(total)}\n(السعر بدون توصيل)\n\nبيانات العميل:\nالاسم: ${name}\nالموبايل: ${phone}\nالعنوان: ${address}\nملاحظات: ${notes}`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${settings.whatsapp}?text=${encoded}`, '_blank');
    });
  }
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

window.addEventListener('DOMContentLoaded', init);