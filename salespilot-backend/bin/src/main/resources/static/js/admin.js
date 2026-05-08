function ensureAdmin() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || role !== "ADMIN") {
    window.location.href = "/admin-login.html";
    return false;
  }

  const welcome = document.getElementById("welcomeText");
  if (welcome) {
    welcome.innerText = `Welcome, ${username}`;
  }

  return true;
}


async function loadAdminData() {

  try {
    const res = await fetch("/admin/dashboard", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    console.log("Status:", res.status);

    if (!res.ok) {
      console.log("API failed");
      return;
    }

    const data = await res.json();
    console.log("DATA:", data);

    // ✅ Cards
    document.getElementById("orders").innerText = data.totalOrders || 0;
    document.getElementById("revenue").innerText = data.totalRevenue || 0;
    document.getElementById("users").innerText = data.totalUsers || 0;

    // ✅ Table
    const table = document.getElementById("orderTable");
    table.innerHTML = "";

    if (!data.recentOrders || data.recentOrders.length === 0) {
      table.innerHTML = "<tr><td colspan='4'>No Orders Found</td></tr>";
      return;
    }

    data.recentOrders.forEach(order => {

      const row = document.createElement("tr");

      const statusClass =
        order.status === "PAID" ? "paid" : "pending";

      row.innerHTML = `
        <td>#${order.id}</td>
        <td>${order.username}</td>
        <td>₹${order.total}</td>
        <td><span class="status ${statusClass}">${order.status}</span></td>
      `;

      table.appendChild(row);
    });

  } catch (err) {
    console.error("ERROR:", err);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminData();

  document.getElementById("welcomeText").innerText =
    "Welcome, " + (localStorage.getItem("username") || "Admin");
});
