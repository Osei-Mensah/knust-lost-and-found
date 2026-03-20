// Handles Login/Logout toggle on all pages
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const loginLogoutBtn = document.getElementById("loginLogoutBtn");

if (loginLogoutBtn) {
  if (currentUser) {
    loginLogoutBtn.href = "#";
    loginLogoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
    loginLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  } else {
    loginLogoutBtn.href = "login.html";
    loginLogoutBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
  }
}
