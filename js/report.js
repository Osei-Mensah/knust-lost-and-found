const form = document.getElementById("report-form");
const imageInput = document.getElementById("item-image");
const preview = document.getElementById("image-preview");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = "block";

    document.getElementById("upload-box").style.display = "none";
    preview.classList.add("preview-visible");
  };

  preview.addEventListener("click", () => {
    imageInput.click();
  });

  reader.readAsDataURL(file);
});

let deviceId = localStorage.getItem("deviceId");

if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);
}

const params = new URLSearchParams(window.location.search);
const editId = params.get("edit");

const savedProfile = JSON.parse(localStorage.getItem("profile"));

if (savedProfile && !editId) {
  document.getElementById("contact-name").value = savedProfile.name || "";

  document.getElementById("contact-phone").value = savedProfile.phone || "";
}
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

if (editId) {
  const itemToEdit = items.find((item) => item.id === editId);

  if (itemToEdit) {
    document.getElementById("contact-name").value =
      itemToEdit.contactName || "";

    document.getElementById("contact-phone").value =
      itemToEdit.contactPhone || "";
    document.getElementById("item-type").value = itemToEdit.type;
    document.getElementById("item-category").value = itemToEdit.category;
    document.getElementById("item-title").value = itemToEdit.title;
    document.getElementById("item-description").value = itemToEdit.description;
    document.getElementById("item-location").value = itemToEdit.location;

    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === itemToEdit.type);
    });

    // Sync category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.category === itemToEdit.category,
      );
    });

    if (itemToEdit.image) {
      const preview = document.getElementById("image-preview");
      preview.src = itemToEdit.image;
      preview.style.display = "block";
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const contactName = document.getElementById("contact-name").value;
  const contactPhone = document.getElementById("contact-phone").value;
  const type = document.getElementById("item-type").value;
  const category = document.getElementById("item-category").value;

  const title = document.getElementById("item-title").value;
  const description = document.getElementById("item-description").value;
  const location = document.getElementById("item-location").value;

  const imageInput = document.getElementById("item-image");
  const file = imageInput.files[0];

  const saveItem = (imageData = "") => {
    if (editId) {
      items = items.map((item) =>
        item.id === editId
          ? {
              ...item,
              type,
              category,
              title,
              description,
              location,
              contactName,
              contactPhone,

              image: imageData || item.image,
            }
          : item,
      );
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        type,
        category,
        title,
        description,
        location,

        contactName,
        contactPhone,

        image: imageData,

        status: "Open",
        owner: deviceId,

        views: 0,
        createdAt: new Date().toISOString(),

        claims: [],
      };

      items.push(newItem);
    }

    localStorage.setItem("items", JSON.stringify(items));

    window.location.href = "index.html";
  };

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      saveItem(e.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    saveItem();
  }
});

const typeButtons = document.querySelectorAll(".type-btn");
const typeSelect = document.getElementById("item-type");

typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    typeButtons.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    typeSelect.value = btn.dataset.type;
  });
});

const categoryButtons = document.querySelectorAll(".category-btn");
const categorySelect = document.getElementById("item-category");

categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    categorySelect.value = btn.dataset.category;
  });
});
