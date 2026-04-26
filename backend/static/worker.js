function loadOrders() {

    fetch("http://127.0.0.1:5000/worker/orders")
    .then(res => res.json())
    .then(data => {

        let div = document.getElementById("orders-container");
        div.innerHTML = "";

        if (data.length === 0) {
            div.innerHTML = "<p>No orders</p>";
            return;
        }

        data.forEach(order => {

            let statusClass = "";

            if (order.status === "Pending") statusClass = "pending";
            else if (order.status === "Preparing") statusClass = "preparing";
            else if (order.status === "Ready") statusClass = "ready";

            div.innerHTML += `
                <div class="order-card ${statusClass}">
                    <h3>Order #${order.id}</h3>
                    <p>Customer: ${order.name}</p>
                    <p>Status: ${order.status}</p>
                    <p>Total: ₹${order.total_amount || 0}</p>

                    <select id="status-${order.id}">
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                    </select>

                    <br>

                    <input type="text" id="time-${order.id}" placeholder="Time (e.g. 15 mins)">

                    <br>

                    <button onclick="updateOrder(${order.id})">Update</button>
                </div>
            `;
        });
    });
}

function updateOrder(id) {

    let status = document.getElementById(`status-${id}`).value;
    let time = document.getElementById(`time-${id}`).value;

    fetch("http://127.0.0.1:5000/worker/update_order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            order_id: id,
            status: status,
            time_estimate: time
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Updated!");
        loadOrders();
    });
}

loadOrders();