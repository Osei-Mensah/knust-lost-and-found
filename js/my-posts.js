const container = document.getElementById("my-posts-container");
const deviceId = localStorage.getItem("deviceId");
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

function renderMyPosts() {
  const items = (JSON.parse(localStorage.getItem("items")) || []).map(
    (item) => ({
      image: "",
      claims: [],
      ...item,
    }),
  );
  const myItems = items.filter((item) => item.owner === deviceId);

  if (myItems.length === 0) {
    container.innerHTML = "<p>You have not posted any items yet.</p>";
    return;
  }

  container.innerHTML = "";

  myItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    const img = item.image
      ? `<img src="${item.image}" class="item-image">`
      : "";
    card.innerHTML = `
  ${img}

  <div class="item-content">
    <h3>${item.title}</h3>

    <p>${item.description}</p>

    <div class="item-meta">
      <span class="item-type">${item.type}</span>
      <span class="item-category">${item.category}</span>
      <span class="item-time">${timeAgo(item.createdAt)}</span>
      <span class="item-views">${item.views} views</span>
    </div>

    <div class="status-badge status-${item.status.toLowerCase()}">
      ${item.status}
    </div>
  </div>
`;
    // Show claims (if any)
    if (item.claims && item.claims.length > 0) {
      const claimsContainer = document.createElement("div");
      claimsContainer.style.marginTop = "10px";

      const title = document.createElement("strong");
      title.textContent = "Claims:";
      claimsContainer.appendChild(title);

      item.claims.forEach((claim) => {
        const claimBox = document.createElement("div");
        if (claim.approved) {
          claimBox.style.border = "2px solid green";
        }

        claimBox.style.marginTop = "6px";
        claimBox.style.padding = "6px";
        claimBox.style.background = "#f4f4f4";
        claimBox.style.borderRadius = "6px";

        const date = document.createElement("small");
        date.textContent = new Date(claim.date).toLocaleString();

        const message = document.createElement("p");
        message.textContent = claim.message;

        claimBox.appendChild(date);
        claimBox.appendChild(message);

        if (item.status !== "Resolved") {
          const approveThisBtn = document.createElement("button");
          approveThisBtn.textContent = "Approve This Claim";

          approveThisBtn.addEventListener("click", (event) => {
            event.stopPropagation();

            const updatedItems = items.map((i) => {
              if (i.id !== item.id) return i;

              return {
                ...i,
                status: "Resolved",
                claims: i.claims.map((c) => ({
                  ...c,
                  approved: c === claim,
                })),
              };
            });

            localStorage.setItem("items", JSON.stringify(updatedItems));
            renderMyPosts();
          });

          claimBox.appendChild(approveThisBtn);
        }

        claimsContainer.appendChild(claimBox);
      });

      card.appendChild(claimsContainer);
    }
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      window.location.href = `report.html?edit=${item.id}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      if (!confirm("Are you sure you want to delete this item?")) return;

      const updatedItems = items.filter((i) => i.id !== item.id);

      localStorage.setItem("items", JSON.stringify(updatedItems));
      renderMyPosts();
    });
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "card-actions";

    actionsDiv.appendChild(editBtn);

    actionsDiv.appendChild(deleteBtn);
    card.appendChild(actionsDiv);

    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${item.id}`;
    });

    container.appendChild(card);
  });
}

renderMyPosts();
