
async function registerUser(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  const messageEl = document.getElementById("message");

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // ✅ Always expect JSON from backend
    const result = await response.json();

    if (!response.ok) {
      messageEl.innerText = result.message || "Registration failed";
      return;
    }

    // ✅ ONLY backend message
    messageEl.innerText = result.message;
	/*
  if (response.ok) {
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1000);
  }
  */
  } catch (error) {
     console.error(error);
     messageEl.innerText = "Server error";
   }
 
}

async function loginUser(event, isAdminLogin = false) {
  console.log("Login triggered");

  event.preventDefault();

  const data = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    document.getElementById("message").innerText = "Invalid credentials";
    return;
  }

  localStorage.setItem("token", result.token);
  localStorage.setItem("username", result.username);
  localStorage.setItem("role", result.role);

  if (result.role === "ADMIN") {
    window.location.href = "/admin-home.html";
  } else {
    window.location.href = "/customer-home.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const adminloginForm = document.getElementById("adminLoginForm");

  if (signupForm) {
    signupForm.addEventListener("submit", registerUser);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => loginUser(e, false));
  }

  if (adminloginForm) {
    adminloginForm.addEventListener("submit", (e) => loginUser(e, true));
  }
});