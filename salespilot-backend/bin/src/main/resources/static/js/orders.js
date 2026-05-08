async function loadOrders() {

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    const res = await fetch("/customer/orders", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    console.log("STATUS:", res.status);

    if (!res.ok) {
      const err = await res.text();
      console.log("ERROR:", err);
      alert("Error loading orders");
      return;
    }

    const orders = await res.json();
    console.log("Orders:", orders);

    const container = document.getElementById("ordersContainer");

    if (!container) {
      console.error("ordersContainer not found");
      return;
    }

    container.innerHTML = "";

    if (!orders.length) {
      container.innerHTML = "<h3>No Orders Found</h3>";
      return;
    }

	orders.forEach(order => {

	  let itemsHtml = "";

	  order.items.forEach(item => {
	    itemsHtml += `
	      <div class="item-row">
	        <img src="${item.product.imageUrl}" />

	        <div class="item-details">
	          <h4>${item.product.name}</h4>
	          <p>Quantity: ${item.quantity}</p>
	          <p class="item-price">₹${item.priceAtPurchase}</p>
	        </div>
	      </div>
	    `;
	  });

	  container.innerHTML += `
	    <div class="order-card">

	      <div class="order-header">
	        <h3>🧾 Order #${order.id}</h3>
	        <span class="status ${order.status}">
	          ${order.status}
	        </span>
	      </div>

	      <div class="items-container">
	        ${itemsHtml}
	      </div>

	      <div class="order-footer">
	        <span>Total: ₹${order.totalAmount}</span>
	        <button onclick="viewOrder(${order.id})">View Details</button>
	      </div>

	    </div>
	  `;
	});
	
  } catch (err) {
    console.error("JS ERROR:", err);
  }
}

// ✅ Back Button
function goBack() {
  window.location.href = "/customer-home.html";
} 

function startShopping() {
  window.location.href = "/customer-home.html";
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
function viewOrder(orderId) {
  console.log("Clicked Order:", orderId); // debug
  window.location.href = "/order-details.html?id=" + orderId;
} 


loadOrders();