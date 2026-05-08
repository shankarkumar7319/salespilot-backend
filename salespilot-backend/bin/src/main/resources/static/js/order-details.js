// ✅ Get order ID from URL
function getOrderId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ✅ Load Order Details
async function loadOrderDetails() {

  const orderId = getOrderId();
  console.log("Order ID:", orderId);

  if (!orderId) {
    alert("Order ID missing ❌");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again ❌");
    window.location.href = "/login.html";
    return;
  }

  try {
    // ✅ FIXED URL
    const res = await fetch(`/customer/payment/orders/${orderId}`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    console.log("Status:", res.status);

    if (!res.ok) {
      alert("API Failed ❌ Status: " + res.status);
      return;
    }

    const order = await res.json();
    console.log("DATA:", order);

    // ✅ FIXED STATUS MAPPING
    let mappedStatus = "PLACED";

    if (order.status === "PAID") mappedStatus = "PLACED";
    if (order.status === "SHIPPED") mappedStatus = "SHIPPED";
    if (order.status === "OUT_FOR_DELIVERY") mappedStatus = "OUT_FOR_DELIVERY";
    if (order.status === "DELIVERED") mappedStatus = "DELIVERED";

    updateTimeline(mappedStatus);

    // ✅ Set Order Summary
    document.getElementById("orderId").innerText = order.id;
    document.getElementById("orderStatus").innerText = order.status;
    document.getElementById("orderTotal").innerText = "₹" + order.totalAmount;

    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";

    if (!order.items || order.items.length === 0) {
      container.innerHTML = "<p>No items found</p>";
      return;
    }

    // ✅ FIXED ITEM ACCESS
	document.getElementById("orderId").innerText = order.orderId;
	order.items.forEach(item => {

	  const div = document.createElement("div");
	  div.className = "item-card";

	  div.innerHTML = `
	  
	   <img src="${item.imageUrl}" class="item-img"/>
	    
	   <div class="item-info">
	      <h4>${item.productName}</h4>
	      <p>Qty: ${item.quantity}</p>
	      <p>Price: ₹${item.price}</p>
	    </div>
	  `;

	  container.appendChild(div);
	});

  } catch (error) {
    console.error("ERROR:", error);
    alert("Something went wrong ❌");
  }
}

// ✅ Timeline
function updateTimeline(status) {

  const steps = document.querySelectorAll(".step");

  let progress = "0%";

  steps.forEach(step => step.classList.remove("active"));

  if (status === "PLACED") {
    steps[0].classList.add("active");
    progress = "25%";
  }
  else if (status === "SHIPPED") {
    steps[0].classList.add("active");
    steps[1].classList.add("active");
    progress = "50%";
  }
  else if (status === "OUT_FOR_DELIVERY") {
    steps[0].classList.add("active");
    steps[1].classList.add("active");
    steps[2].classList.add("active");
    progress = "75%";
  }
  else if (status === "DELIVERED") {
    steps.forEach(step => step.classList.add("active"));
    progress = "100%";
  }

  document.querySelector(".timeline").style.setProperty("--progress", progress);
}

// ✅ Back Button
function goBack() {
  window.location.href = "/orders.html";
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
// ✅ AUTO LOAD
loadOrderDetails();