const DEFAULT_PRODUCTS = [
  { name: "Bluetooth Speaker", price: 3200, cat: "electronics", img: "banner.jpg" },
  { name: "Air Fryer", price: 7800, cat: "electronics", img: "banner.jpg" },
  { name: "Knife Set", price: 2450, cat: "utensils", img: "banner.jpg" },
  { name: "Non-stick Pot", price: 3900, cat: "utensils", img: "banner.jpg" },
  { name: "Velvet Throw Pillows", price: 2800, cat: "home", img: "banner.jpg" },
  { name: "Luxury Storage Basket", price: 1600, cat: "home", img: "banner.jpg" },
  { name: "Premium Organizer", price: 1250, cat: "lifestyle", img: "banner.jpg" },
  { name: "Grooming Kit", price: 2100, cat: "lifestyle", img: "banner.jpg" },
];

const DEFAULT_BANNERS = [
  {
    title: "Weekly Discount Festival",
    description: "Save up to 40% on selected kitchen and electronics items.",
    image: "banner.jpg",
  },
];

const DEFAULT_SOCIALS = { facebook: "", instagram: "", tiktok: "", x: "", youtube: "" };

const state = {
  products: JSON.parse(localStorage.getItem("products") || "null") || DEFAULT_PRODUCTS,
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  banners: JSON.parse(localStorage.getItem("banners") || "null") || DEFAULT_BANNERS,
  bannerIndex: Number(localStorage.getItem("bannerIndex") || 0),
  socials: JSON.parse(localStorage.getItem("socials") || "null") || DEFAULT_SOCIALS,
  logo: localStorage.getItem("logo") || "logo.png",
};

const grids = {
  electronics: document.getElementById("electronics"),
  utensils: document.getElementById("utensils"),
  home: document.getElementById("home"),
  lifestyle: document.getElementById("lifestyle"),
};

const cartEl = document.getElementById("cart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const bannerTitle = document.getElementById("bannerTitle");
const bannerDescription = document.getElementById("bannerDescription");
const bannerImg = document.getElementById("bannerImg");
const bannerMeta = document.getElementById("bannerMeta");
const paymentNote = document.getElementById("paymentNote");
const logoImg = document.getElementById("logoImg");
const socialLinks = document.getElementById("socialLinks");

function save() {
  localStorage.setItem("products", JSON.stringify(state.products));
  localStorage.setItem("cart", JSON.stringify(state.cart));
  localStorage.setItem("banners", JSON.stringify(state.banners));
  localStorage.setItem("bannerIndex", String(state.bannerIndex));
  localStorage.setItem("socials", JSON.stringify(state.socials));
  localStorage.setItem("logo", state.logo);
}

function readImage(fileInput) {
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0];
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function renderProducts() {
  Object.values(grids).forEach((grid) => {
    grid.innerHTML = "";
  });

  const query = (document.getElementById("search").value || "").trim().toLowerCase();
  const filtered = state.products.filter((p) => p.name.toLowerCase().includes(query));

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.img || "banner.jpg"}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p>KES ${Number(product.price).toLocaleString()}</p>
      <button class="solid-btn">Add to basket</button>
    `;

    card.querySelector("button").onclick = () => {
      state.cart.push(product);
      save();
      renderCart();
    };

    grids[product.cat]?.appendChild(card);
  });
}

function renderCart() {
  cartCount.textContent = String(state.cart.length);
  const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  cartTotal.textContent = total.toLocaleString();

  cartItems.innerHTML = state.cart
    .map(
      (item, i) => `
      <div class="cart-item-row">
        <img src="${item.img || "banner.jpg"}" alt="${item.name}" />
        <div class="cart-details">
          <strong>${item.name}</strong>
          <p>KES ${Number(item.price).toLocaleString()}</p>
        </div>
        <button class="outline-btn" onclick="removeFromCart(${i})">Remove</button>
      </div>
    `,
    )
    .join("");
}

function renderBanner() {
  if (!state.banners.length) return;
  const safeIndex = ((state.bannerIndex % state.banners.length) + state.banners.length) % state.banners.length;
  const active = state.banners[safeIndex];
  bannerTitle.textContent = active.title;
  bannerDescription.textContent = active.description;
  bannerImg.src = active.image;
  bannerMeta.textContent = `Slide ${safeIndex + 1} of ${state.banners.length}`;
}

function renderSocialLinks() {
  const entries = Object.entries(state.socials).filter(([, link]) => link);
  if (!entries.length) {
    socialLinks.innerHTML = '<span class="note">Add your social links from the admin panel.</span>';
    return;
  }

  socialLinks.innerHTML = entries
    .map(([name, link]) => `<a href="${link}" target="_blank" rel="noopener noreferrer">${name.toUpperCase()}</a>`)
    .join("");
}

function hydrateSocialInputs() {
  document.getElementById("facebookInput").value = state.socials.facebook || "";
  document.getElementById("instagramInput").value = state.socials.instagram || "";
  document.getElementById("tiktokInput").value = state.socials.tiktok || "";
  document.getElementById("xInput").value = state.socials.x || "";
  document.getElementById("youtubeInput").value = state.socials.youtube || "";
}

window.removeFromCart = (index) => {
  state.cart.splice(index, 1);
  save();
  renderCart();
};

document.getElementById("viewCartBtn").onclick = () => {
  cartEl.classList.toggle("hidden");
};

document.getElementById("addProduct").onclick = async () => {
  const name = document.getElementById("pName").value.trim();
  const price = Number(document.getElementById("pPrice").value);
  const cat = document.getElementById("pCat").value;
  const fileInput = document.getElementById("pImgFile");

  if (!name || !price || !cat || !fileInput.files.length) {
    alert("Please enter product name, price, category and upload a product photo.");
    return;
  }

  const img = await readImage(fileInput);
  state.products.unshift({ name, price, cat, img });

  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  fileInput.value = "";

  save();
  renderProducts();
};

document.getElementById("addBanner").onclick = async () => {
  const title = document.getElementById("bannerTitleInput").value.trim();
  const description = document.getElementById("bannerDescriptionInput").value.trim();
  const bannerFileInput = document.getElementById("bannerImageFileInput");

  if (!title || !description || !bannerFileInput.files.length) {
    alert("Add banner title, description and upload an image.");
    return;
  }

  const image = await readImage(bannerFileInput);
  state.banners.push({ title, description, image });
  state.bannerIndex = state.banners.length - 1;

  document.getElementById("bannerTitleInput").value = "";
  document.getElementById("bannerDescriptionInput").value = "";
  bannerFileInput.value = "";

  save();
  renderBanner();
};

document.getElementById("replaceBannerImage").onclick = async () => {
  const replaceBannerFileInput = document.getElementById("replaceBannerFileInput");
  if (!replaceBannerFileInput.files.length) {
    alert("Upload an image to replace current banner slide.");
    return;
  }
  const image = await readImage(replaceBannerFileInput);
  const safeIndex = ((state.bannerIndex % state.banners.length) + state.banners.length) % state.banners.length;
  state.banners[safeIndex].image = image;
  replaceBannerFileInput.value = "";
  save();
  renderBanner();
};

document.getElementById("saveLogo").onclick = async () => {
  const logoFileInput = document.getElementById("logoFileInput");
  if (!logoFileInput.files.length) {
    alert("Upload a logo image first.");
    return;
  }

  state.logo = await readImage(logoFileInput);
  logoImg.src = state.logo;
  logoFileInput.value = "";
  save();
};

document.getElementById("saveSocial").onclick = () => {
  state.socials = {
    facebook: document.getElementById("facebookInput").value.trim(),
    instagram: document.getElementById("instagramInput").value.trim(),
    tiktok: document.getElementById("tiktokInput").value.trim(),
    x: document.getElementById("xInput").value.trim(),
    youtube: document.getElementById("youtubeInput").value.trim(),
  };

  save();
  renderSocialLinks();
};

document.getElementById("nextBanner").onclick = () => {
  state.bannerIndex += 1;
  save();
  renderBanner();
};

document.getElementById("clearCart").onclick = () => {
  state.cart = [];
  save();
  renderCart();
};

document.getElementById("search").oninput = renderProducts;

document.getElementById("payMpesa").onclick = async () => {
  const phone = document.getElementById("mpesaPhone").value.trim();
  const till = document.getElementById("mpesaTill").value.trim();
  const apiUrl = document.getElementById("mpesaApi").value.trim();
  const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  if (!state.cart.length) {
    paymentNote.textContent = "Add products to cart before starting M-Pesa payment.";
    return;
  }

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, till, amount: total, cart: state.cart }),
      });

      if (!response.ok) {
        throw new Error("Failed to trigger STK push");
      }

      paymentNote.textContent = "STK push sent. Check your phone to complete M-Pesa payment.";
      return;
    } catch (error) {
      paymentNote.textContent = "Unable to reach STK backend. Using fallback payment guidance below.";
    }
  }

  const message = encodeURIComponent(
    `Hello China Shop Kenya, I want to pay KES ${total.toLocaleString()} via M-Pesa. My number is ${phone}. Till/Paybill: ${till}.`,
  );
  window.open(`https://wa.me/?text=${message}`, "_blank");
  paymentNote.textContent = `Fallback opened. Complete M-Pesa payment to Till/Paybill ${till} then share your confirmation message.`;
};

setInterval(() => {
  state.bannerIndex += 1;
  save();
  renderBanner();
}, 5000);

document.getElementById("year").textContent = new Date().getFullYear();
logoImg.src = state.logo;
hydrateSocialInputs();
renderProducts();
renderCart();
renderBanner();
renderSocialLinks();
save();
