function ensureCustomer() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!token || role !== "USER") {
    window.location.replace("/login.html");
    return false;
  }

  const welcome = document.getElementById("welcomeText");
  if (welcome) {
    welcome.innerText = `Welcome, ${username}`;
  }

  return true;
}

function getToken() {
  return localStorage.getItem("token");
}

function startShopping() {
  loadProducts();
}

function goBackToShopping() {
  window.location.href = "/customer-home.html";
}

function goToCart() {
    window.location.href = "/view-cart.html";
}

function goToOrders() {
    window.location.href = "/orders.html";
}

function goToTransactions() {
    window.location.href = "/transactions.html";
}

async function loadProducts() {
  const response = await fetch("/products", {
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  if (response.status === 401) {
    logout();
    return;
  }

  const products = await response.json();

  const shoppingSection = document.getElementById("shoppingSection");
  const productList = document.getElementById("productList");

  shoppingSection.style.display = "block";

  // handle both array & object response
  const productArray = Array.isArray(products) ? products : products.data;

  if (!productArray || productArray.length === 0) {
    productList.innerHTML = "<p>No products found</p>";
    return;
  }

  let html = "";

  productArray.forEach(product => {
	html += `
	  <div class="product-card">
	    <img src="${product.imageUrl || ''}" alt="${product.name}" />

	    <div class="product-info">
	      <h3 class="product-title">${product.name}</h3>

		  <p class="description">
		          ${product.description || "No description available"}
		   </p>
		   
		  <div class="rating">⭐⭐⭐⭐⭐ ${product.rating || 4.3}</div>
		  
	      <div class="price-row">
	        <span class="price">₹${product.price}</span>
	        <span class="stock">In stock (${product.stock})</span>
	      </div>

	      <p class="category">${product.category}</p>

	      <button onclick="addToCart(${product.id})">
	        Add to Cart
	      </button>
	    </div>
	  </div>
	`;
  });

  productList.innerHTML = html;
}
  
  
async function addToCart(productId) {
  const response = await fetch("/customer/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify({
      productId: productId,
      quantity: 1
    })
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    logout();
    return;
  }

  if (!response.ok) {
    alert(result.message)  /*|| "Failed to add product to cart"); */
    return;
  }

  alert(result.message) /* || "Product added to cart"); */
}

async function loadCart() {
  const response = await fetch("/customer/cart", {
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  if (response.status === 401) {
    logout();
    return;
  }

  const cart = await response.json();

  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");

  if (!cart.items.length) {
    cartList.innerHTML = "<p class='empty-state'>🛒 Your cart is empty</p>";
    cartTotal.innerText = "";
    return;
  }

  let html = "";

  cart.items.forEach(item => {
    html += `
      <div class="product-card">

        <img src="${item.imageUrl || 'https://via.placeholder.com/200'}" />

        <div class="product-info">

          <h3 class="product-title">${item.productName}</h3>

          <div class="rating">⭐⭐⭐⭐ 4.2</div>

		  <div class="price-row">
		    <span class="price">₹${item.price}</span>

		    <div class="qty-box">
		      <button onclick="decreaseQty(${item.cartItemId})">−</button>

		      <input type="number" id="qty-${item.cartItemId}" value="${item.quantity}" min="1"/>

		      <button onclick="increaseQty(${item.cartItemId})">+</button>
		    </div>
		  </div>

          <p class="category">Subtotal: ₹${item.subtotal}</p>

		  <div class="cart-actions">
		    <button class="update-btn" onclick="updateCartItem(${item.cartItemId})">
		      Update
		    </button>

		    <button class="remove-btn" onclick="removeCartItem(${item.cartItemId})">
		      Remove
		    </button>
		  </div>

        </div>
      </div>
    `;
  });

  cartList.innerHTML = html;
  cartTotal.innerText = `Total: ₹${cart.totalAmount}`;
}

function increaseQty(cartItemId) {
  const input = document.getElementById(`qty-${cartItemId}`);
  input.value = Number(input.value) + 1;
}

function decreaseQty(cartItemId) {
  const input = document.getElementById(`qty-${cartItemId}`);
  const current = Number(input.value);

  if (current > 1) {
    input.value = current - 1;
  }
}

async function updateCartItem(cartItemId) {
  const quantity = document.getElementById(`qty-${cartItemId}`).value;

  const response = await fetch(`/customer/cart/${cartItemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify({
      quantity: Number(quantity)
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    alert(result.message || "Failed to update cart item");
    return;
  }

 /* alert(result.message || "Cart updated")*/;
  loadCart();
}

async function removeCartItem(cartItemId) {
  const response = await fetch(`/customer/cart/${cartItemId}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    alert(result.message || "Failed to remove cart item");
    return;
  }

  /* alert(result.message || "Item removed from cart"); */
  loadCart();
}


async function checkout() {
  if (typeof Razorpay === "undefined") {
    alert("Razorpay SDK not loaded");
    return;
  }

  const createOrderResponse = await fetch("/customer/payment/create-order", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  if (createOrderResponse.status === 401) {
    logout();
    return;
  }

  const orderData = await createOrderResponse.json().catch(() => ({}));

  if (!createOrderResponse.ok) {
    alert(orderData.message || "Failed to create payment order");
    return;
  }

  const username = localStorage.getItem("username") || "Customer";

  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Payments",
    description: "Cart Payment",
    order_id: orderData.razorpayOrderId,

    // ✅ SUCCESS HANDLER
    handler: async function (response) {

      await fetch("/customer/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify({
          localOrderId: orderData.localOrderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature
        })
      });

      alert("Payment successful ✅");
      window.location.href = "/orders.html";
    },

    // ✅ USER CLOSES POPUP
    modal: {
      ondismiss: async function () {

        console.log("User closed payment popup");

        await fetch("/customer/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
          },
          body: JSON.stringify({
            localOrderId: orderData.localOrderId,
            razorpayPaymentId: null,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpaySignature: null
          })
        });

      }
    },

    prefill: {
      name: username
    },

    theme: {
      color: "#2563eb"
    }
  };

  const rzp = new Razorpay(options);

  // ✅ PAYMENT FAILED EVENT (FIXED)
  rzp.on("payment.failed", async function (response) {

    console.log("FAILED RESPONSE:", response);

    await fetch("/customer/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({
        localOrderId: orderData.localOrderId,

        // 🔥 IMPORTANT FIX
        razorpayPaymentId: response.error?.metadata?.payment_id 
                          || "FAILED_" + Date.now(),

        razorpayOrderId: response.error?.metadata?.order_id 
                         || orderData.razorpayOrderId,

        razorpaySignature: null
      })
    });

    alert("Payment failed ❌");
  });

  rzp.open();
}


function goBack() {
	window.location.href = "/customer-home.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.replace("/index.html");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureCustomer()) return;

  if (document.getElementById("cartList")) {
    loadCart();
  }
});