const products = [
  {
    id: 1,
    name: '黑色愛心唇膏',
    category: '彩妝',
    price: 526,
    description: '微霧感持色，日常上妝也能很有氣質。',
    tag: '新品',
    gradient: 'linear-gradient(135deg, #d7d4cf, #f1efee)'
  },
  {
    id: 2,
    name: '豹紋小包',
    category: '配件',
    price: 1280,
    description: '輕巧百搭，小物收納與穿搭都好看。',
    tag: '熱賣',
    gradient: 'linear-gradient(135deg, #e4e0d8, #c8c3bb)'
  },
  {
    id: 3,
    name: '海鹽焦糖餅乾',
    category: '零食',
    price: 420,
    description: '香脆酥口，搭配咖啡最適合這個氛圍。',
    tag: '限量',
    gradient: 'linear-gradient(135deg, #f2e8dc, #d3d0ca)'
  },
  {
    id: 4,
    name: '法式毛呢外套',
    category: '服飾',
    price: 2490,
    description: '簡約剪裁，層次感強烈，穿出日常氣場。',
    tag: '推薦',
    gradient: 'linear-gradient(135deg, #d6d1cb, #ebe8e3)'
  },
  {
    id: 5,
    name: '輕柔遮瑕餅',
    category: '彩妝',
    price: 760,
    description: '自然妝感輕薄不卡粉，適合上班與約會。',
    tag: '人氣',
    gradient: 'linear-gradient(135deg, #e8e1da, #d8d0c9)'
  },
  {
    id: 6,
    name: '豹紋絲巾',
    category: '配件',
    price: 860,
    description: '提升整體穿搭感，百搭又有個性。',
    tag: '最愛',
    gradient: 'linear-gradient(135deg, #ddd5ca, #bdb6ac)'
  },
  {
    id: 7,
    name: '伯爵奶香餅乾',
    category: '零食',
    price: 390,
    description: '奶香與茶香交織，適合下午小酌放鬆。',
    tag: '超值',
    gradient: 'linear-gradient(135deg, #efe9e0, #d1d2ce)'
  },
  {
    id: 8,
    name: '寬鬆羊毛針織',
    category: '服飾',
    price: 1890,
    description: '包覆感十足，柔和質感與日常穿搭完美配合。',
    tag: '人氣',
    gradient: 'linear-gradient(135deg, #d9d4cf, #f1efe9)'
  }
];

const productGrid = document.getElementById('productGrid');
const featuredGrid = document.getElementById('featuredGrid');
const wishlistGrid = document.getElementById('wishlistGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const totalEl = document.getElementById('total');
const cartPanel = document.getElementById('cart');
const overlay = document.getElementById('overlay');
const giftProgress = document.getElementById('giftProgress');
const filterButtons = document.querySelectorAll('.filter');

const cart = JSON.parse(localStorage.getItem('sunrise-cart')) || [];
const favorites = new Set(JSON.parse(localStorage.getItem('yeji-shop-wishlist')) || []);
let selectedCategory = 'all';

function formatPrice(value) {
  return `NT$ ${value.toLocaleString()}`;
}

function renderProductCard(product, metaLabel) {
  const isFavorite = favorites.has(product.id);

  return `
    <article class="card">
      <div class="image-box ${product.id % 3 === 0 ? 'three' : product.id % 2 === 0 ? 'two' : 'one'}" style="background:${product.gradient};">
        <span class="tag">${product.tag}</span>
        <button
          class="favorite-btn${isFavorite ? ' active' : ''}"
          type="button"
          data-action="favorite"
          data-id="${product.id}"
          aria-label="${isFavorite ? '從願望清單移除' : '加入願望清單'}：${product.name}"
          aria-pressed="${isFavorite}"
        >♥</button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span>${product.category}</span>
          <span>${metaLabel}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price-row">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-btn" type="button" data-id="${product.id}">加入購物車</button>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const featured = products.slice(0, 4);

  featuredGrid.innerHTML = featured.map((product) => renderProductCard(product, '人氣')).join('');
}

function renderProducts(category = selectedCategory) {
  let visible = products;

  if (category === 'favorites') {
    visible = products.filter((product) => favorites.has(product.id));
  } else if (category !== 'all') {
    visible = products.filter((product) => product.category === category);
  }

  productGrid.innerHTML = visible.length
    ? visible.map((product) => renderProductCard(product, '庫存充足')).join('')
    : '<p class="empty-wishlist">還沒有收藏商品，點商品卡片上的愛心即可加入。</p>';
}

function renderWishlist() {
  const savedProducts = products.filter((product) => favorites.has(product.id));
  wishlistGrid.innerHTML = savedProducts.length
    ? savedProducts.map((product) => renderProductCard(product, '已收藏')).join('')
    : '<p class="empty-wishlist">願望清單還是空的，逛逛商品並點選愛心收藏吧！</p>';
}

function saveFavorites() {
  localStorage.setItem('yeji-shop-wishlist', JSON.stringify([...favorites]));
}

function saveCart() {
  localStorage.setItem('sunrise-cart', JSON.stringify(cart));
}

function getCartItem(productId) {
  return cart.find((item) => item.id === productId);
}

function addToCart(productId) {
  const existing = getCartItem(productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function updateQuantity(productId, delta) {
  const item = getCartItem(productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function removeItem(productId) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index !== -1) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function getSubtotal() {
  return cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderGiftProgress(subtotal) {
  const nextMilestone = subtotal < 1500
    ? 1500
    : subtotal < 3000
      ? 3000
      : (Math.floor(subtotal / 5000) + 1) * 5000;
  const ticketCount = Math.floor(subtotal / 5000);
  const nextMessage = subtotal >= nextMilestone
    ? ''
    : `再消費 ${formatPrice(nextMilestone - subtotal)}，即可達成下一個滿額門檻。`;

  giftProgress.innerHTML = `
    <p><strong>滿額禮進度</strong>（依商品小計計算）</p>
    <p>${subtotal >= 1500 ? '✓' : '○'} 滿 NT$ 1,500：隨機造型小卡一張</p>
    <p>${subtotal >= 3000 ? '✓' : '○'} 滿 NT$ 3,000：再加贈灰灰荷蘭豬鑰匙圈</p>
    <p>${ticketCount ? '✓' : '○'} 視訊互動抽獎券：${ticketCount} 張（每滿 NT$ 5,000 一張）</p>
    ${nextMessage ? `<p>${nextMessage}</p>` : ''}
    <p>每月底抽出 3 位，與荷蘭豬視訊互動 2 分鐘。</p>
  `;
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  const subtotal = getSubtotal();
  renderGiftProgress(subtotal);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty">購物車還是空的，快去挑選好物吧！</p>';
    subtotalEl.textContent = 'NT$ 0';
    shippingEl.textContent = 'NT$ 0';
    totalEl.textContent = 'NT$ 0';
    return;
  }

  const cartProducts = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) return null;

      const sum = product.price * item.quantity;
      return `
        <div class="cart-item">
          <div class="cart-thumb" style="background:${product.gradient};"></div>
          <div>
            <h4>${product.name}</h4>
            <div class="price">${formatPrice(product.price)}</div>
            <div class="item-control">
              <div>
                <button class="qty-btn" data-action="decrease" data-id="${product.id}">-</button>
                <span class="item-qty">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-id="${product.id}">+</button>
              </div>
              <button class="remove-btn" data-id="${product.id}">移除</button>
            </div>
          </div>
          <strong>${formatPrice(sum)}</strong>
        </div>
      `;
    })
    .join('');

  cartItems.innerHTML = cartProducts;

  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(shipping);
  totalEl.textContent = formatPrice(total);
}

function openCart() {
  cartPanel.classList.add('open');
  overlay.classList.add('active');
}

function closeCart() {
  cartPanel.classList.remove('open');
  overlay.classList.remove('active');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    selectedCategory = button.dataset.category;
    renderProducts();
  });
});

document.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.favorite-btn');
  if (favoriteButton) {
    const productId = Number(favoriteButton.dataset.id);
    if (favorites.has(productId)) {
      favorites.delete(productId);
    } else {
      favorites.add(productId);
    }
    saveFavorites();
    renderFeaturedProducts();
    renderProducts();
    renderWishlist();
    return;
  }

  const addButton = event.target.closest('.add-btn');
  if (addButton) {
    addToCart(Number(addButton.dataset.id));
    openCart();
    return;
  }

  const qtyBtn = event.target.closest('.qty-btn');
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.id);
    const action = qtyBtn.dataset.action;
    updateQuantity(id, action === 'increase' ? 1 : -1);
    return;
  }

  const removeBtn = event.target.closest('.remove-btn');
  if (removeBtn) {
    removeItem(Number(removeBtn.dataset.id));
    return;
  }

  if (event.target.id === 'cartToggle') {
    openCart();
  }

  if (event.target.id === 'closeCart' || event.target.id === 'overlay') {
    closeCart();
  }

  if (event.target.id === 'checkoutBtn') {
    alert('付款功能示範中，感謝您的購買！');
  }
});

renderFeaturedProducts();
renderProducts();
renderWishlist();
renderCart();
