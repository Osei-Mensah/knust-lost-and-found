let items = JSON.parse(localStorage.getItem("items")) || [];
items = items.map((item) => ({
  claims: [],
  views: 0,
  category: "Other",
  location: "",
  contactName: "",
  contactPhone: "",
  image: "",
  createdAt: new Date().toISOString(),
  ...item,
}));

let filteredItems = items;

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderItems() {
  container.innerHTML = ""; // clear anything inside

  filteredItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const img = item.image
      ? `<img src="${item.image}" class="item-image">`
      : "";
    card.innerHTML = `
  ${img}

  <div class="item-content">
   <h3 class="item-title">${escapeHtml(item.title)}</h3>
<p class="item-description">${escapeHtml(item.description)}</p>

    <div class="item-meta">
    <span class="item-type">${item.type}</span>
    <span class="item-category">${item.category}</span>
    <span class="item-time">
  <i data-lucide="clock"></i>
  ${timeAgo(item.createdAt)}
</span>

<span class="item-views">
  <i data-lucide="eye"></i>
  ${item.views} ${item.views === 1 ? "view" : "views"}
</span>
     </div>

    <div class="status-badge status-${item.status.toLowerCase()}">
      ${item.status}
    </div>
  </div>
`;
    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${item.id}`;
    });

    container.appendChild(card);

    lucide.createIcons();
  });
}

const searchInput = document.getElementById("search-input");

const categoryFilter = document.getElementById("category-filter");

const typeFilter = document.getElementById("type-filter");

const container = document.getElementById("items-container");

const statusFilter = document.getElementById("status-filter");

function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter.value;

  filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;

    const matchesType = selectedType === "" || item.type === selectedType;

    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  renderItems();
}

searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

applyFilters();

const hero = document.querySelector(".hero");
