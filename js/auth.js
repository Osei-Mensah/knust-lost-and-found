// ── HELPERS ─────────────────────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("deviceId", user.id);
}

// ── REGISTER ────────────────────────────────────────────────────
const registerBtn = document.getElementById("register-btn");

if (registerBtn) {
  let selectedRole = "";

  // Role buttons
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedRole = btn.dataset.role;
    });
  });

  registerBtn.addEventListener("click", () => {
    const name     = document.getElementById("reg-name").value.trim();
    const email    = document.getElementById("reg-email").value.trim();
    const idNumber = document.getElementById("reg-id").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm  = document.getElementById("reg-confirm").value;
    const errorEl  = document.getElementById("reg-error");

    // Validations
    if (!name || !email || !idNumber || !selectedRole || !password || !confirm) {
      errorEl.textContent = "Please fill in all fields and select a role.";
      errorEl.style.display = "block";
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters.";
      errorEl.style.display = "block";
      return;
    }

    if (password !== confirm) {
      errorEl.textContent = "Passwords do not match.";
      errorEl.style.display = "block";
      return;
    }

    const users = getUsers();

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      errorEl.textContent = "An account with this email already exists.";
      errorEl.style.display = "block";
      return;
    }

    // Create user
    const newUser = {
      id:       crypto.randomUUID(),
      name,
      email,
      idNumber,
      role:     selectedRole,
      password, // in a real app, this would be hashed
      joinedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    // Redirect to home
    window.location.href = "index.html";
  });
}

// ── LOGIN ────────────────────────────────────────────────────────
const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email    = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl  = document.getElementById("login-error");

    if (!email || !password) {
      errorEl.textContent = "Please enter your email and password.";
      errorEl.style.display = "block";
      return;
    }

    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      errorEl.textContent = "Invalid email or password.";
      errorEl.style.display = "block";
      return;
    }

    setCurrentUser(user);
    window.location.href = "index.html";
  });
}
