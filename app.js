const state = {
  products: JSON.parse(localStorage.getItem('products')||'[]'),
  cart: JSON.parse(localStorage.getItem('cart')||'[]')
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
function save(){ localStorage.setItem('products', JSON.stringify(state.products)); localStorage.setItem('cart', JSON.stringify(state.cart)); }
function render(){
  Object.values(grids).forEach(g=>g.innerHTML='');
  const q = document.getElementById('search').value?.toLowerCase() || '';
  state.products.filter(p=>p.name.toLowerCase().includes(q)).forEach((p)=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${p.img || 'https://via.placeholder.com/300x200?text=Product'}"/><h4>${p.name}</h4><p>KES ${p.price}</p><button>Add to Cart</button>`;
    card.querySelector('button').onclick = ()=>{ state.cart.push(p); save(); updateCart(); };
    grids[p.cat]?.appendChild(card);
  });
  updateCart();
}
function updateCart(){
  cartCount.textContent = state.cart.length;
  cartItems.innerHTML = state.cart.map((p,i)=>`<div class="card"><strong>${p.name}</strong> – KES ${p.price} <button onclick="removeFromCart(${i})">Remove</button></div>`).join('');
}
window.removeFromCart = (i)=>{ state.cart.splice(i,1); save(); updateCart(); };
document.getElementById('addProduct').onclick = ()=>{
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const cat = document.getElementById('pCat').value;
  const img = document.getElementById('pImg').value.trim();
  if(!name || !price) return alert('Name & price required');
  state.products.push({name, price, cat, img, onSale:true});
  save(); render();
};
document.getElementById('viewCartBtn').onclick = ()=> cartEl.classList.toggle('hidden');
document.getElementById('clearCart').onclick = ()=>{ state.cart=[]; save(); updateCart(); };
document.getElementById('search').oninput = render;
document.getElementById('year').textContent = new Date().getFullYear();
render();
