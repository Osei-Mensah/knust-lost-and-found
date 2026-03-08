const deviceId = localStorage.getItem("deviceId");

const items = JSON.parse(localStorage.getItem("items")) || [];

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const detailsBox = document.getElementById("details-box");

const item = items.find((x) => x.id === id);
// increment views
if (item) {
  item.views = (item.views || 0) + 1;

  const updatedItems = items.map((i) => (i.id === item.id ? item : i));

  localStorage.setItem("items", JSON.stringify(updatedItems));
}

if (!item) {
  detailsBox.innerHTML = `<p>Item not found.</p>`;
} else {
  let ownerNotice = "";

  if (item.owner === deviceId) {
    ownerNotice = `<p class="small"><em>You posted this item.</em></p>`;
  }

  let claimSection = "";

  if (
    item.type === "found" &&
    item.status !== "Resolved" &&
    item.owner !== deviceId
  ) {
    claimSection = `
    <hr />
    <h3>Claim this item</h3>
    <p class="small">Briefly describe what proves it’s yours.</p>
    <textarea id="claim-message" placeholder="Example: The lock screen wallpaper is..."></textarea>
    <br /><br />
    <button id="claim-btn">Submit Claim</button>
  `;
  }

  const img = item.image ? `<img src="${item.image}" class="item-image">` : "";
  detailsBox.innerHTML = `
  ${img}

  <h2>${item.title}</h2>
  <p><b>Type:</b> ${item.type}</p>
  <p><b>Location:</b> ${item.location}</p>

  <div class="status-badge status-${item.status.toLowerCase()}">${item.status}</div>

  ${ownerNotice}

  <p>${item.description}</p>

  ${claimSection}

  <p><a href="index.html">← Back to Home</a></p>
`;
  const claimBtn = document.getElementById("claim-btn");

  if (claimBtn) {
    claimBtn.addEventListener("click", () => {
      const message = document.getElementById("claim-message").value.trim();

      if (message === "") {
        alert("Please enter a claim message.");
        return;
      }

      const updatedItems = items.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: "Pending",
              claims: [
                ...(i.claims || []),
                {
                  message: message,
                  claimantId: deviceId,
                  date: new Date().toISOString(),
                  approved: false,
                },
              ],
            }
          : i,
      );

      localStorage.setItem("items", JSON.stringify(updatedItems));

      alert("Claim submitted. Item is now Pending.");
      window.location.reload();
    });
  }
}
