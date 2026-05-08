function getToken() {
  return localStorage.getItem("token");
}

function ensureAdminAccess() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    window.location.replace("/admin-login.html");
    return false;
  }

  return true;
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function addProduct(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    imageUrl: document.getElementById("imageUrl").value
  };

  const response = await fetch("/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    document.getElementById("message").innerText = "Failed to add product";
    return;
  }

  document.getElementById("message").innerText = "Product added successfully";

  setTimeout(() => {
    window.location.href = "/all-products-admin.html";
  }, 1000);
}


async function loadAllProducts() {
  const response = await fetch("/admin/products", {
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  // 🔐 AUTH CHECK
  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin-login.html");
    return;
  }

  const products = await response.json();
  const productList = document.getElementById("productList");

  // ❌ EMPTY STATE
  if (!products || products.length === 0) {
    productList.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px;">
          No products found
        </td>
      </tr>
    `;
    return;
  }

  // ✅ RENDER TABLE ROWS
  productList.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>₹${product.price}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>

      <td>
        <div style="display:flex; gap:6px;">
          
          <a href="/view-product-admin.html?id=${product.id}"
             style="padding:6px 10px; background:#6b7280; color:#fff; border-radius:6px; text-decoration:none; font-size:12px;">
            View
          </a>

          <a href="/edit-product.html?id=${product.id}"
             style="padding:6px 10px; background:#4f46e5; color:#fff; border-radius:6px; text-decoration:none; font-size:12px;">
            Edit
          </a>

          <button onclick="deleteProduct(${product.id})"
            style="padding:6px 10px; background:#ef4444; color:#fff; border:none; border-radius:6px; font-size:12px; cursor:pointer;">
            Delete
          </button>

        </div>
      </td>
    </tr>
  `).join("");
}

async function loadProduct() {

  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) return;

  const res = await fetch(`/admin/products/${id}`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  if (res.status === 401) {
     alert("Session expired");
     return;
  }

  if (res.status === 403) {
     alert("Access denied");
     return;
  }

  if (!res.ok) {
    console.log("Failed to load product");
    return;
  }

  const p = await res.json();

  document.getElementById("productDetails").innerHTML = `
    <div class="card">

      <img src="${p.imageUrl || 'https://via.placeholder.com/300'}" />

      <div class="info">

        <div class="name">${p.name}</div>

        <div class="badge">ID: ${p.id}</div>

        <div class="desc">${p.description}</div>

        <div class="price">₹${p.price}</div>

        <div class="grid">

          <div class="box"><b>Stock:</b> ${p.stock}</div>
          <div class="box"><b>Category:</b> ${p.category}</div>

        </div>

      </div>

    </div>
  `;
}

async function prefillEditForm() {
  const id = getProductIdFromUrl();
  if (!id) return;

  const response = await fetch(`/admin/products/${id}`, {
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  if (response.status === 401 || response.status === 403) {
    window.location.replace("/admin-login.html");
    return;
  }

  const product = await response.json();

  document.getElementById("name").value = product.name;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;
  document.getElementById("stock").value = product.stock;
  document.getElementById("category").value = product.category;
  document.getElementById("imageUrl").value = product.imageUrl || "";
}

async function updateProduct(event) {
  event.preventDefault();

  const id = getProductIdFromUrl();

  const data = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    imageUrl: document.getElementById("imageUrl").value
  };

  const response = await fetch(`/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    document.getElementById("message").innerText = "Failed to update product";
    return;
  }

  document.getElementById("message").innerText = "Product updated successfully";

  setTimeout(() => {
    window.location.href = "/all-products-admin.html";
  }, 1000);
}


async function deleteProduct(id) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  const response = await fetch(`/admin/products/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  if (!response.ok) {
    alert("Failed to delete product");
    return;
  }

  alert("Product deleted successfully");
  loadAllProducts();
}


document.addEventListener("DOMContentLoaded", () => {
  if (!ensureAdminAccess()) return;

  const addProductForm = document.getElementById("addProductForm");
  const editProductForm = document.getElementById("editProductForm");
  const productList = document.getElementById("productList");
  const productDetails = document.getElementById("productDetails");

  if (addProductForm) {
    addProductForm.addEventListener("submit", addProduct);
  }

  if (editProductForm) {
    prefillEditForm();
    editProductForm.addEventListener("submit", updateProduct);
  }

  if (productList) {
    loadAllProducts();
  }

  if (productDetails) {
    loadProduct();
  }
});