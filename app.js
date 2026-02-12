const starterProducts = [
  { name: 'Stainless Sufuria Set', price: 3200, cat: 'utensils', img: 'https://via.placeholder.com/300x200?text=Sufuria+Set', onSale: true },
  { name: 'Electric Kettle 2L', price: 1800, cat: 'electronics', img: 'https://via.placeholder.com/300x200?text=Electric+Kettle', onSale: true },
  { name: 'Decor Throw Pillows', price: 950, cat: 'home', img: 'https://via.placeholder.com/300x200?text=Throw+Pillows', onSale: false },
  { name: 'Exam Exercise Books (Pack)', price: 450, cat: 'stationery', img: 'https://via.placeholder.com/300x200?text=Exercise+Books', onSale: true },
  { name: 'Airtight Food Containers', price: 1200, cat: 'new', img: 'https://via.placeholder.com/300x200?text=Food+Containers', onSale: true }
];

const state = {
  products: JSON.parse(localStorage.getItem('products') || 'null') || starterProducts,
  cart: JSON.parse(localStorage.getItem('cart') || '[]')
};
const grids = {
  new: document.getElementById('new'),
  utensils: document.getElementById('utensils'),
  electronics: document.getElementById('electronics'),
  home: document.getElementById('home'),
  stationery: document.getElementById('stationery'),
};
const cartEl = document.getElementById('cart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

function save() {
  localStorage.setItem('products', JSON.stringify(state.products));
  localStorage.setItem('cart', JSON.stringify(state.cart));
}
function render() {
  Object.values(grids).forEach((g) => {
    g.innerHTML = '';
  });

  const q = document.getElementById('search').value?.toLowerCase() || '';
  state.products
    .filter((p) => p.name.toLowerCase().includes(q))
    .forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img || 'https://via.placeholder.com/300x200?text=Product'}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>KES ${Number(p.price).toLocaleString()}</p>
      <button>Add to Cart</button>
    `;

    card.querySelector('button').onclick = () => {
      state.cart.push(p);
      save();
      updateCart();
    };

    grids[p.cat]?.appendChild(card);
  });

  updateCart();
}

function updateCart() {
  const total = state.cart.reduce((sum, p) => sum + Number(p.price || 0), 0);
  cartCount.textContent = state.cart.length;
  cartTotal.textContent = total.toLocaleString();

  if (!state.cart.length) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = state.cart
    .map((p, i) => `
      <div class="card cart-row">
        <strong>${p.name}</strong>
        <span>KES ${Number(p.price).toLocaleString()}</span>
        <button onclick="removeFromCart(${i})">Remove</button>
      </div>
    `)
    .join('');
}

window.removeFromCart = (i) => {
  state.cart.splice(i, 1);
  save();
  updateCart();
};

document.getElementById('addProduct').onclick = () => {
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const cat = document.getElementById('pCat').value;
  const img = document.getElementById('pImg').value.trim();

  if (!name || price <= 0) {
    alert('Please provide a product name and a valid price greater than 0.');
    return;
  }

  state.products.push({ name, price, cat, img, onSale: true });
  save();
  render();
};

document.getElementById('viewCartBtn').onclick = () => cartEl.classList.toggle('hidden');
document.getElementById('clearCart').onclick = () => {
  state.cart = [];
  save();
  updateCart();
};

document.getElementById('checkoutWhatsApp').onclick = () => {
  if (!state.cart.length) {
    alert('Add items to cart before checkout.');
    return;
  }

  const items = state.cart.map((p) => `• ${p.name} - KES ${Number(p.price).toLocaleString()}`).join('%0A');
  const total = state.cart.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const mpesa = encodeURIComponent(document.getElementById('mpesa').value.trim() || '0711493400');
  const message = `Hello China Shop Kenya!%0A%0AI want to order:%0A${items}%0A%0ATotal: KES ${total.toLocaleString()}%0APreferred M-Pesa: ${mpesa}`;
  window.open(`https://wa.me/254700000000?text=${message}`, '_blank');
};

document.getElementById('search').oninput = render;
document.getElementById('year').textContent = new Date().getFullYear();

save();
render();
