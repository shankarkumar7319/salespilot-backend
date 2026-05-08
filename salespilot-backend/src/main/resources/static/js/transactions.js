async function loadTransactions() {

  const token = localStorage.getItem("token");

  // ❌ No token
  if (!token) {
    alert("Please login again ❌");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("/customer/payment/transactions", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    console.log("Status:", res.status);

    const table = document.getElementById("txnTable");
    table.innerHTML = "";

    // ❌ If unauthorized
    if (res.status === 401 || res.status === 403) {
      table.innerHTML = `
        <tr>
          <td colspan="3" style="color:red;">
            Session expired / Unauthorized ❌
          </td>
        </tr>
      `;
      return;
    }

    const transactions = await res.json();
    console.log("DATA:", transactions);

    // ❌ No data
    if (!transactions || transactions.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="3">No Transactions Found</td>
        </tr>
      `;
      return;
    }

	transactions.forEach(txn => {

	  const row = document.createElement("tr");

	  // ✅ SAFE STATUS HANDLING
	  const status = (txn.status || "PENDING").toUpperCase();

	  let statusClass = "";
	  let statusText = "";

	  if (status === "SUCCESS") {
	    statusClass = "success";
	    statusText = "✅ SUCCESS";
	  } 
	  else if (status === "FAILED") {
	    statusClass = "failed";
	    statusText = "❌ FAILED";
	  } 
	  else {
	    statusClass = "pending";
	    statusText = "⏳ PENDING";
	  }

	  row.innerHTML = `
	    <td>${txn.paymentId || "-"}</td>
	    <td>${txn.orderId || txn.order?.id || "-"}</td>
	    <td class="${statusClass}">${statusText}</td>
	  `;

	  table.appendChild(row);
	});

  } catch (err) {
    console.error("ERROR:", err);
  }
}

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

// ✅ Call function
loadTransactions();