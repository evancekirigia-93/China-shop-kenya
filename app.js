const DEFAULT_CATEGORIES = ["Electronics", "Utensils", "Home & Decor", "Beauty & Lifestyle"];
const DEFAULT_PRODUCTS = [
  { name: "Bluetooth Speaker", price: 3200, cat: "electronics", img: "banner.jpg" },
  { name: "Air Fryer", price: 7800, cat: "electronics", img: "banner.jpg" },
  { name: "Knife Set", price: 2450, cat: "utensils", img: "banner.jpg" },
  { name: "Non-stick Pot", price: 3900, cat: "utensils", img: "banner.jpg" },
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

const categoryWrap = document.getElementById("categories");
const cartCount = document.getElementById("cartCount");
const bannerImg = document.getElementById("bannerImg");
const bannerLink = document.getElementById("bannerLink");
const bannerMeta = document.getElementById("bannerMeta");
const logoImg = document.getElementById("logoImg");
const socialLinks = document.getElementById("socialLinks");
const discountList = document.getElementById("discountList");

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
  document.getElementById("discountCat").innerHTML = catOptions;
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
      <img src="${product.img || "banner.jpg"}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p>KES ${Number(product.price).toLocaleString()}</p>
      <button class="solid-btn">Add to basket</button>
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

function renderDiscounts() {
  if (!state.discounts.length) {
    discountList.innerHTML = '<p class="note">No discounts yet. Add from the Discount Tab in admin.</p>';
    return;
  }

  discountList.innerHTML = state.discounts
    .map((d) => `
      <article class="card deal-card">
        <img src="${d.img || "banner.jpg"}" alt="${d.name}" />
        <h4>${d.name}</h4>
        <p>${d.percent}% OFF · ${d.cat}</p>
      </article>
    `)
    .join("");
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
  renderCategories();
  renderProducts();
};

document.getElementById("addProduct").onclick = async () => {
  const name = document.getElementById("pName").value.trim();
  const price = Number(document.getElementById("pPrice").value);
  const cat = document.getElementById("pCat").value;
  const fileInput = document.getElementById("pImgFile");
  if (!name || !price || !cat || !fileInput.files.length) return alert("Please enter product name, price, category and upload a product photo.");

  const img = await readImage(fileInput);
  state.products.unshift({ name, price, cat, img });
  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
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

document.getElementById("addDiscount").onclick = async () => {
  const name = document.getElementById("discountName").value.trim();
  const percent = Number(document.getElementById("discountPercent").value);
  const cat = document.getElementById("discountCat").value;
  const fileInput = document.getElementById("discountImgFile");
  if (!name || !percent || !cat || !fileInput.files.length) return alert("Fill discount name, %, category and image.");

  const img = await readImage(fileInput);
  state.discounts.unshift({ name, percent, cat, img });
  document.getElementById("discountName").value = "";
  document.getElementById("discountPercent").value = "";
  fileInput.value = "";
  save();
  renderDiscounts();
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
renderCategories();
renderProducts();
renderBanner();
renderDiscounts();
renderSocialLinks();
save();
