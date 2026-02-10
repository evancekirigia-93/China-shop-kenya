const DEFAULT_CATEGORIES = ["Electronics", "Utensils", "Home & Decor", "Beauty & Lifestyle"];
const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Bluetooth Speaker", price: 3200, cat: "electronics", img: "banner.jpg", description: "Portable speaker with clear sound for indoor and outdoor use.", manual: "Charge fully before first use. Keep away from water and direct flames." },
  { id: "p2", name: "Air Fryer", price: 7800, cat: "electronics", img: "banner.jpg", description: "Compact air fryer with fast heat circulation and simple controls.", manual: "Preheat 3 minutes. Do not exceed basket max line. Clean basket after each use." },
  { id: "p3", name: "Knife Set", price: 2450, cat: "utensils", img: "banner.jpg", description: "Multi-purpose kitchen knife set for slicing and chopping.", manual: "Hand wash and dry after use. Store safely in stand." },
  { id: "p4", name: "Non-stick Pot", price: 3900, cat: "utensils", img: "banner.jpg", description: "Durable non-stick pot ideal for everyday meals.", manual: "Use medium heat and non-metal utensils to protect coating." },
];
const DEFAULT_BANNERS = [{ image: "banner.jpg", targetCat: "electronics" }];
const DEFAULT_SOCIALS = { facebook: "", instagram: "", tiktok: "", x: "", youtube: "" };

const state = {
  categories: JSON.parse(localStorage.getItem("categories") || "null") || DEFAULT_CATEGORIES,
  products: JSON.parse(localStorage.getItem("products") || "null") || DEFAULT_PRODUCTS,
  discounts: JSON.parse(localStorage.getItem("discounts") || "[]"),
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  banners: JSON.parse(localStorage.getItem("banners") || "null") || DEFAULT_BANNERS,
  bannerIndex: Number(localStorage.getItem("bannerIndex") || 0),
  socials: JSON.parse(localStorage.getItem("socials") || "null") || DEFAULT_SOCIALS,
  logo: localStorage.getItem("logo") || "logo.png",
};

state.products = state.products.map((product, index) => ({
  ...product,
  id: product.id || `p-${Date.now()}-${index}`,
  description: product.description || "",
  manual: product.manual || "",
}));

const categoryWrap = document.getElementById("categories");
const categoryNavLinks = document.getElementById("categoryNavLinks");
const cartCount = document.getElementById("cartCount");
const bannerImg = document.getElementById("bannerImg");
const bannerLink = document.getElementById("bannerLink");
const bannerMeta = document.getElementById("bannerMeta");
const logoImg = document.getElementById("logoImg");
const socialLinks = document.getElementById("socialLinks");

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function save() {
  localStorage.setItem("categories", JSON.stringify(state.categories));
  localStorage.setItem("products", JSON.stringify(state.products));
  localStorage.setItem("discounts", JSON.stringify(state.discounts));
  localStorage.setItem("cart", JSON.stringify(state.cart));
  localStorage.setItem("banners", JSON.stringify(state.banners));
  localStorage.setItem("bannerIndex", String(state.bannerIndex));
  localStorage.setItem("socials", JSON.stringify(state.socials));
  localStorage.setItem("logo", state.logo);
}

function readImage(fileInput) {
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0];
    if (!file) return reject(new Error("No file selected"));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function renderCategoryOptions() {
  const catOptions = state.categories
    .map((name) => `<option value="${slugify(name)}">${name}</option>`)
    .join("");
  document.getElementById("pCat").innerHTML = catOptions;
  document.getElementById("bannerTargetCat").innerHTML = catOptions;
}

function renderCategoryNav() {
  categoryNavLinks.innerHTML = state.categories
    .map((name) => `<a href="#cat-${slugify(name)}">${name}</a>`)
    .join("");
}

function renderCategories() {
  categoryWrap.innerHTML = state.categories
    .map((name) => `
      <article class="category-row" id="cat-${slugify(name)}">
        <div class="category-head"><h3>${name}</h3></div>
        <div class="products-row" data-cat="${slugify(name)}"></div>
      </article>
    `)
    .join("");
}

function renderProducts() {
  document.querySelectorAll(".products-row").forEach((row) => { row.innerHTML = ""; });
  const query = (document.getElementById("search").value || "").trim().toLowerCase();
  const filtered = state.products.filter((p) => p.name.toLowerCase().includes(query));

  filtered.forEach((product) => {
    const row = document.querySelector(`.products-row[data-cat="${product.cat}"]`);
    if (!row) return;

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <a class="product-link" href="product.html?id=${product.id}">
        <img src="${product.img || "banner.jpg"}" alt="${product.name}" />
      </a>
      <a class="product-link" href="product.html?id=${product.id}"><h4>${product.name}</h4></a>
      <p>KES ${Number(product.price).toLocaleString()}</p>
      <div class="card-actions">
        <a class="outline-btn" href="product.html?id=${product.id}">Read details</a>
        <button class="solid-btn">Add to basket</button>
      </div>
    `;

    card.querySelector("button").onclick = () => {
      state.cart.push(product);
      save();
      cartCount.textContent = String(state.cart.length);
    };
    row.appendChild(card);
  });
}

function renderBanner() {
  if (!state.banners.length) return;
  const safeIndex = ((state.bannerIndex % state.banners.length) + state.banners.length) % state.banners.length;
  const active = state.banners[safeIndex];
  bannerImg.src = active.image;
  bannerLink.href = `#cat-${active.targetCat}`;
  bannerMeta.textContent = `Banner ${safeIndex + 1} of ${state.banners.length} · Target: ${active.targetCat}`;
}

function renderSocialLinks() {
  const entries = Object.entries(state.socials).filter(([, link]) => link);
  if (!entries.length) {
    socialLinks.innerHTML = '<span class="note">Add your social links from the admin panel.</span>';
    return;
  }
  socialLinks.innerHTML = entries.map(([name, link]) => `<a href="${link}" target="_blank" rel="noopener noreferrer">${name.toUpperCase()}</a>`).join("");
}

function hydrateSocialInputs() {
  document.getElementById("facebookInput").value = state.socials.facebook || "";
  document.getElementById("instagramInput").value = state.socials.instagram || "";
  document.getElementById("tiktokInput").value = state.socials.tiktok || "";
  document.getElementById("xInput").value = state.socials.x || "";
  document.getElementById("youtubeInput").value = state.socials.youtube || "";
}

document.getElementById("viewCartBtn").onclick = () => {
  window.open("cart.html", "_blank", "noopener");
};

document.getElementById("addCategory").onclick = () => {
  const value = document.getElementById("newCategoryInput").value.trim();
  if (!value) return alert("Enter category name.");
  if (state.categories.some((c) => slugify(c) === slugify(value))) return alert("Category already exists.");

  state.categories.push(value);
  document.getElementById("newCategoryInput").value = "";
  save();
  renderCategoryOptions();
  renderCategoryNav();
  renderCategories();
  renderProducts();
};

document.getElementById("addProduct").onclick = async () => {
  const name = document.getElementById("pName").value.trim();
  const price = Number(document.getElementById("pPrice").value);
  const cat = document.getElementById("pCat").value;
  const description = document.getElementById("pDescription").value.trim();
  const manual = document.getElementById("pManual").value.trim();
  const fileInput = document.getElementById("pImgFile");
  if (!name || !price || !cat || !fileInput.files.length) return alert("Please enter product name, price, category and upload a product photo.");

  const img = await readImage(fileInput);
  state.products.unshift({ id: `p${Date.now()}`, name, price, cat, img, description, manual });
  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pDescription").value = "";
  document.getElementById("pManual").value = "";
  fileInput.value = "";
  save();
  renderProducts();
};

document.getElementById("addBanner").onclick = async () => {
  const bannerFileInput = document.getElementById("bannerImageFileInput");
  const targetCat = document.getElementById("bannerTargetCat").value;
  if (!bannerFileInput.files.length || !targetCat) return alert("Upload banner image and choose target category.");

  const image = await readImage(bannerFileInput);
  state.banners.push({ image, targetCat });
  state.bannerIndex = state.banners.length - 1;
  bannerFileInput.value = "";
  save();
  renderBanner();
};

document.getElementById("replaceBannerImage").onclick = async () => {
  const replaceBannerFileInput = document.getElementById("replaceBannerFileInput");
  if (!replaceBannerFileInput.files.length) return alert("Upload an image to replace current banner slide.");

  const image = await readImage(replaceBannerFileInput);
  const safeIndex = ((state.bannerIndex % state.banners.length) + state.banners.length) % state.banners.length;
  state.banners[safeIndex].image = image;
  replaceBannerFileInput.value = "";
  save();
  renderBanner();
};

document.getElementById("saveLogo").onclick = async () => {
  const logoFileInput = document.getElementById("logoFileInput");
  if (!logoFileInput.files.length) return alert("Upload a logo image first.");

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

document.getElementById("search").oninput = renderProducts;

setInterval(() => {
  state.bannerIndex += 1;
  save();
  renderBanner();
}, 5000);

document.getElementById("year").textContent = new Date().getFullYear();
logoImg.src = state.logo;
cartCount.textContent = String(state.cart.length);
hydrateSocialInputs();
renderCategoryOptions();
renderCategoryNav();
renderCategories();
renderProducts();
renderBanner();
renderSocialLinks();
save();
