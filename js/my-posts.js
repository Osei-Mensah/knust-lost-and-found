// ── LOAD USER PROFILE ───────────────────────────────────────────
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser) {
  const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase();
  document.getElementById("sidebarAvatar").textContent = initials;
  document.getElementById("sidebarName").textContent = currentUser.name;
  document.getElementById("sidebarId").textContent = currentUser.idNumber;
  document.getElementById("sidebarBadge").textContent = currentUser.role;
  const joined = new Date(currentUser.joinedAt);
  document.getElementById("sidebarSince").textContent = `Member since ${joined.toLocaleString("default", { month: "long", year: "numeric" })}`;

  // Pre-fill settings with correct label
  document.getElementById("settings-name").value = currentUser.name;
  document.getElementById("settings-email").value = currentUser.email;
  document.getElementById("settings-id").value = currentUser.idNumber;
  document.getElementById("settings-id-label").textContent =
    currentUser.role === "Student" ? "Student ID" : "Staff ID";

// Change Login link to Logout
  const loginLink = document.querySelector("a[href='login.html']");
  if (loginLink) {
    loginLink.href = "#";
    loginLink.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }
}
const container = document.getElementById("my-posts-container");
const deviceId = localStorage.getItem("deviceId");

let currentTab = "active";

// ── SIDEBAR NAVIGATION ──────────────────────────────────────────
const sections = {
  overview:      document.getElementById("overviewSection"),
  notifications: document.getElementById("notificationsSection"),
  settings:      document.getElementById("settingsSection"),
  posts:         document.getElementById("postsSection"),
};

const sidebarBtns = {
  overview:      document.getElementById("overviewBtn"),
  notifications: document.getElementById("notificationsBtn"),
  settings:      document.getElementById("settingsBtn"),
  posts:         document.getElementById("myPostsBtn"),
};

function showSection(name) {
  Object.values(sections).forEach(s => s.style.display = "none");
  document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
  sections[name].style.display = "block";
  sidebarBtns[name].classList.add("active");
  if (name === "overview") renderOverview();
}

function renderNotifications() {
  const items = (JSON.parse(localStorage.getItem("items")) || []).map(item => ({ claims: [], views: 0, ...item }));
  const myItems = items.filter(item => item.owner === deviceId);
  const list = document.getElementById("notificationsList");
  list.innerHTML = "";

  const notifications = [];

  myItems.forEach(item => {
    // Views milestone
    if (item.views >= 100) {
      notifications.push({
        icon: "fa-eye",
        text: `Your <strong>${item.title}</strong> post has reached ${item.views} views!`,
        time: timeAgo(item.createdAt),
        unread: true,
      });
    } else if (item.views >= 10) {
      notifications.push({
        icon: "fa-eye",
        text: `Your <strong>${item.title}</strong> post has ${item.views} views`,
        time: timeAgo(item.createdAt),
        unread: false,
      });
    }

    // Claims received
    if (item.claims && item.claims.length > 0) {
      item.claims.forEach(claim => {
        if (!claim.approved) {
          notifications.push({
            icon: "fa-hand",
            text: `Someone has claimed your <strong>${item.title}</strong> — review it in My Posts`,
            time: timeAgo(claim.date),
            unread: true,
          });
        } else {
          notifications.push({
            icon: "fa-handshake",
            text: `You approved a claim on <strong>${item.title}</strong> — item matched!`,
            time: timeAgo(claim.date),
            unread: false,
          });
        }
      });
    }

    // Resolved/matched
    if (item.status === "Resolved") {
      notifications.push({
        icon: "fa-circle-check",
        text: `Your <strong>${item.title}</strong> has been successfully matched`,
        time: timeAgo(item.createdAt),
        unread: false,
      });
    }
  });

  if (notifications.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:#888;margin-top:20px;">No notifications yet.</p>`;
    return;
  }

  notifications.forEach(notif => {
    const item = document.createElement("div");
    item.className = `notification-item ${notif.unread ? "unread" : ""}`;
    item.innerHTML = `
      <i class="fa-solid ${notif.icon}"></i>
      <p>${notif.text}</p>
      <span class="notif-time">${notif.time}</span>
    `;
    list.appendChild(item);
  });

  // Update the notification badge count
  const unreadCount = notifications.filter(n => n.unread).length;
  const badge = document.querySelector(".notif-badge");
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

function showSection(name) {
  Object.values(sections).forEach(s => s.style.display = "none");
  document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
  sections[name].style.display = "block";
  sidebarBtns[name].classList.add("active");
  if (name === "overview") renderOverview();
  if (name === "notifications") renderNotifications();
}

sidebarBtns.overview.addEventListener("click", (e) => { e.preventDefault(); showSection("overview"); });
sidebarBtns.notifications.addEventListener("click", (e) => { e.preventDefault(); showSection("notifications"); });
sidebarBtns.settings.addEventListener("click", (e) => { e.preventDefault(); showSection("settings"); });
sidebarBtns.posts.addEventListener("click", (e) => { e.preventDefault(); showSection("posts"); renderMyPosts(); });

// ── INIT ────────────────────────────────────────────────────────
showSection("posts");
renderMyPosts();
renderNotifications();

// cancel settings goes back to posts
document.getElementById("cancelSettings").addEventListener("click", () => showSection("posts"));

// save settings feedback
document.querySelector(".save-btn").addEventListener("click", () => {
  const currentPassword = document.getElementById("settings-current-password");
  const newPassword = document.getElementById("settings-new-password");
  const confirmPassword = document.getElementById("settings-confirm-password");

  if (newPassword.value || confirmPassword.value) {
    if (!currentPassword.value) {
      alert("Please enter your current password to change it.");
      currentPassword.style.border = "2px solid #e53935";
      return;
    }
    if (currentPassword.value !== currentUser.password) {
      alert("Current password is incorrect.");
      currentPassword.style.border = "2px solid #e53935";
      return;
    }
    if (newPassword.value.length < 6) {
      alert("New password must be at least 6 characters.");
      newPassword.style.border = "2px solid #e53935";
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      alert("Passwords do not match.");
      confirmPassword.style.border = "2px solid #e53935";
      return;
    }
    currentPassword.style.border = "1px solid #e0e0e0";
    newPassword.style.border = "1px solid #e0e0e0";
    confirmPassword.style.border = "1px solid #e0e0e0";
    currentUser.password = newPassword.value;
  }

  currentUser.name = document.getElementById("settings-name").value;
  currentUser.email = document.getElementById("settings-email").value;
  currentUser.idNumber = document.getElementById("settings-id").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const updatedUsers = users.map(u => u.id === currentUser.id ? currentUser : u);
  localStorage.setItem("users", JSON.stringify(updatedUsers));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("sidebarName").textContent = currentUser.name;
  document.getElementById("sidebarId").textContent = currentUser.idNumber;

  alert("Settings saved successfully!");
});

// ── TIME AGO ────────────────────────────────────────────────────
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

// ── OVERVIEW ────────────────────────────────────────────────────
function renderOverview() {
  const items = (JSON.parse(localStorage.getItem("items")) || []).map(item => ({ image: "", claims: [], ...item }));
  const myItems = items.filter(item => item.owner === deviceId);

  document.getElementById("totalPosts").textContent    = myItems.length;
  document.getElementById("lostCount").textContent     = myItems.filter(i => i.type === "lost").length;
  document.getElementById("foundCount").textContent    = myItems.filter(i => i.type === "found").length;
  document.getElementById("resolvedCount").textContent = myItems.filter(i => i.status === "Resolved").length;

  const list = document.getElementById("overviewPostsList");
  list.innerHTML = "";

  if (myItems.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:#888;">You have no posts yet.</p>`;
    return;
  }

  myItems.forEach(item => {
    const typeColor = item.type === "found"
      ? "background:#00bcd4;color:white;"
      : "background:#e53935;color:white;";

    const img = item.image
      ? `<img src="${item.image}" class="item-image">`
      : `<div class="item-image-placeholder"></div>`;

    const card = document.createElement("div");
    card.className = "item-card";
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
          </div>
        </div>
      </div>
    `;
    card.addEventListener("click", () => { window.location.href = `details.html?id=${item.id}`; });
    list.appendChild(card);
  });
}

// ── TABS ────────────────────────────────────────────────────────
function renderTabs() {
  const tabsDiv = document.createElement("div");
  tabsDiv.className = "posts-tabs";

  const activeBtn = document.createElement("button");
  activeBtn.textContent = "Active Posts";
  activeBtn.className = `tab-btn ${currentTab === "active" ? "tab-active" : "tab-inactive"}`;

  const matchedBtn = document.createElement("button");
  matchedBtn.textContent = "Matched";
  matchedBtn.className = `tab-btn ${currentTab === "matched" ? "tab-active" : "tab-inactive"}`;

  activeBtn.addEventListener("click", () => { currentTab = "active"; renderMyPosts(); });
  matchedBtn.addEventListener("click", () => { currentTab = "matched"; renderMyPosts(); });

  tabsDiv.appendChild(activeBtn);
  tabsDiv.appendChild(matchedBtn);
  return tabsDiv;
}

// ── MY POSTS ────────────────────────────────────────────────────
function renderMyPosts() {
  const items = (JSON.parse(localStorage.getItem("items")) || []).map(item => ({ image: "", claims: [], ...item }));
  const myItems = items.filter(item => item.owner === deviceId);

  container.innerHTML = "";
  container.appendChild(renderTabs());

  const filtered = myItems.filter(item => {
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

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

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

      item.claims.forEach(claim => {
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
            const updatedItems = items.map(i => {
              if (i.id !== item.id) return i;
              return { ...i, status: "Resolved", claims: i.claims.map(c => ({ ...c, approved: c === claim })) };
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

    card.addEventListener("click", () => { window.location.href = `details.html?id=${item.id}`; });
    container.appendChild(card);
  });
}

// ── INIT ────────────────────────────────────────────────────────
showSection("posts");
renderMyPosts();
