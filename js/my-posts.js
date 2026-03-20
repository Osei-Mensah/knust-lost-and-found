const container = document.getElementById("my-posts-container");
const deviceId = localStorage.getItem("deviceId");

let currentTab = "active";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const intervals = [
    { label: "year",   seconds: 31536000 },
    { label: "month",  seconds: 2592000  },
    { label: "day",    seconds: 86400    },
    { label: "hour",   seconds: 3600     },
    { label: "minute", seconds: 60       },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function renderTabs() {
  const tabsDiv = document.createElement("div");
  tabsDiv.className = "posts-tabs";

  const activeBtn = document.createElement("button");
  activeBtn.textContent = "Active Posts";
  activeBtn.className = `tab-btn ${currentTab === "active" ? "tab-active" : "tab-inactive"}`;

  const matchedBtn = document.createElement("button");
  matchedBtn.textContent = "Matched";
  matchedBtn.className = `tab-btn ${currentTab === "matched" ? "tab-active" : "tab-inactive"}`;

  activeBtn.addEventListener("click", () => {
    currentTab = "active";
    renderMyPosts();
  });

  matchedBtn.addEventListener("click", () => {
    currentTab = "matched";
    renderMyPosts();
  });

  tabsDiv.appendChild(activeBtn);
  tabsDiv.appendChild(matchedBtn);
  return tabsDiv;
}

function renderMyPosts() {
  const items = (JSON.parse(localStorage.getItem("items")) || []).map((item) => ({
    image: "",
    claims: [],
    ...item,
  }));

  const myItems = items.filter((item) => item.owner === deviceId);

  container.innerHTML = "";
  container.appendChild(renderTabs());

  const filtered = myItems.filter((item) => {
    if (currentTab === "active") return item.status !== "Resolved";
    if (currentTab === "matched") return item.status === "Resolved";
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "text-align:center;color:#888;margin-top:40px;";
    empty.textContent = currentTab === "active"
      ? "You have no active posts."
      : "You have no matched posts yet.";
    container.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    // type badge color
    const typeColor = item.type === "found"
  ? "background:#00bcd4;color:white;"
  : "background:#e53935;color:white;";

    const img = item.image
      ? `<img src="${item.image}" class="item-image">`
      : `<div class="item-image-placeholder"></div>`;

   card.innerHTML = `
  ${img}
  <div class="item-content">
    <div class="card-top">
      <h3 class="item-title">${item.title}</h3>
      <p class="item-description">${item.description}</p>
    </div>
    <div class="card-bottom">
      <div class="item-meta">
        <span class="item-time"><i class="fa-regular fa-clock"></i> ${timeAgo(item.createdAt)}</span>
        <span class="item-views"><i class="fa-regular fa-eye"></i> ${item.views} ${item.views === 1 ? "view" : "views"}</span>
      </div>
      <div class="card-right">
        <span class="type-badge" style="${typeColor}">${item.type}</span>
        <button class="edit-btn">Edit</button>
      </div>
    </div>
  </div>
`;

    // Edit button
    card.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `report.html?edit=${item.id}`;
    });

    // Claims
    if (item.claims && item.claims.length > 0) {
      const claimsContainer = document.createElement("div");
      claimsContainer.style.marginTop = "10px";

      const title = document.createElement("strong");
      title.textContent = "Claims:";
      claimsContainer.appendChild(title);

      item.claims.forEach((claim) => {
        const claimBox = document.createElement("div");
        if (claim.approved) claimBox.style.border = "2px solid green";
        claimBox.style.cssText = "margin-top:6px;padding:6px;background:#f4f4f4;border-radius:6px;";

        const date = document.createElement("small");
        date.textContent = new Date(claim.date).toLocaleString();

        const message = document.createElement("p");
        message.textContent = claim.message;

        claimBox.appendChild(date);
        claimBox.appendChild(message);

        if (item.status !== "Resolved") {
          const approveBtn = document.createElement("button");
          approveBtn.textContent = "Approve This Claim";
          approveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const updatedItems = items.map((i) => {
              if (i.id !== item.id) return i;
              return {
                ...i,
                status: "Resolved",
                claims: i.claims.map((c) => ({ ...c, approved: c === claim })),
              };
            });
            localStorage.setItem("items", JSON.stringify(updatedItems));
            renderMyPosts();
          });
          claimBox.appendChild(approveBtn);
        }

        claimsContainer.appendChild(claimBox);
      });

      card.appendChild(claimsContainer);
    }

    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${item.id}`;
    });

    container.appendChild(card);
  });
}

renderMyPosts();
