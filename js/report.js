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
  };

  reader.readAsDataURL(file);
});

let deviceId = localStorage.getItem("deviceId");

if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);
}

const params = new URLSearchParams(window.location.search);
const editId = params.get("edit");

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
    document.getElementById("item-type").value = itemToEdit.type;
    document.getElementById("item-category").value = itemToEdit.category;
    document.getElementById("item-title").value = itemToEdit.title;
    document.getElementById("item-description").value = itemToEdit.description;
    document.getElementById("item-location").value = itemToEdit.location;

    if (itemToEdit.image) {
      const preview = document.getElementById("image-preview");
      preview.src = itemToEdit.image;
      preview.style.display = "block";
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

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

        contactName: "",
        contactPhone: "",

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
