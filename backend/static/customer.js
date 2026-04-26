/* MENU DATA */
const menuData = [
    {id:1, name:"Paneer Tikka", price:180, image:"/static/panner_tikka.webp"},
    {id:2, name:"Veg Manchurian", price:150, image:"/static/veg_manchurian.jpg"},
    {id:3, name:"Chicken Lollipop", price:200, image:"/static/chicken_lollipop.jpeg"},
    {id:4, name:"Chicken 65", price:220, image:"/static/chicken_65.jpeg"},
    {id:5, name:"Chicken Biryani", price:250, image:"/static/Chicken_Biryani.jpg"},
    {id:6, name:"Mutton Biryani", price:320, image:"/static/mutton_biriyani.jpg"},
    {id:7, name:"Egg Biryani", price:180, image:"/static/egg_biriyani.jpeg"},
    {id:8, name:"Butter Chicken", price:220, image:"/static/butter_chicken.jpg"},
    {id:9, name:"Paneer Butter Masala", price:200, image:"/static/butter_panner.jpeg"},
    {id:10, name:"Kadai Chicken", price:240, image:"/static/kadai_chicken.jpg"},
    {id:11, name:"Butter Naan", price:40, image:"/static/butter_naan.jpeg"},
    {id:12, name:"Tandoori Roti", price:30, image:"/static/tandoori_roti.jpeg"},
    {id:13, name:"Garlic Naan", price:50, image:"/static/garlic_naan.jpeg"},
    {id:14, name:"Chicken Fried Rice", price:180, image:"/static/chicken_fried_rice.jpg"},
    {id:15, name:"Veg Fried Rice", price:170, image:"/static/veg_fried_rice.jpg"},
    {id:16, name:"Noodles", price:160, image:"/static/noodles.webp"},
    {id:17, name:"Ice Cream", price:100, image:"/static/ice_cream.jpeg"},
    {id:18, name:"Brownie", price:120, image:"/static/brownie.jpeg"},
    {id:19, name:"Fruit Salad", price:90, image:"/static/fruit_salad.jpeg"}
];

let cart = {};
let total = 0;

/* LOAD PAGE */
window.onload = function () {
    loadMenu();
};

/* LOAD MENU */
function loadMenu() {
    let menuContainer = document.getElementById("menu-container");
    menuContainer.innerHTML = "";

    menuData.forEach(item => {
        menuContainer.innerHTML += `
            <div class="card">
                <img src="${item.image}" />
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
                    Add
                </button>
            </div>
        `;
    });
}

/* CART */
function addToCart(id, name, price) {

    if (cart[id]) {
        cart[id].quantity += 1;
    } else {
        cart[id] = {
            id: id,
            name: name,
            price: price,
            quantity: 1   // 🔥 MUST BE quantity
        };
    }

    updateCart();
}

function updateCart() {

    let cartItems = document.getElementById("cart-items");
    let totalDisplay = document.getElementById("total");

    cartItems.innerHTML = "";

    let total = 0;

    Object.values(cart).forEach(item => {
        let li = document.createElement("li");
        li.innerText = `${item.name} - ₹${item.price} x ${item.quantity}`;
        cartItems.appendChild(li);

        total += item.price * item.quantity;
    });

    totalDisplay.innerText = "Total: ₹" + total;
}

function displayCart() {
    const cartDiv = document.getElementById("cart-items");
    cartDiv.innerHTML = "";
    total = 0;

    Object.keys(cart).forEach(id => {
        let item = cart[id];
        let itemTotal = item.price * item.qty;
        total += itemTotal;

        cartDiv.innerHTML += `
            <li>${item.name} - ₹${item.price} × ${item.qty} = ₹${itemTotal}</li>
        `;
    });

    document.getElementById("total").innerText = "Total: ₹" + total;
}

function loadProfile() {
    const user_id = localStorage.getItem("user_id");

    fetch(`http://127.0.0.1:5000/get_profile/${user_id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("profile-name").innerText = data.name;
            document.getElementById("profile-phone").innerText = data.phone;
        });
}

/* PLACE ORDER */
function placeOrder() {

    if (Object.keys(cart).length === 0) {
        alert("Add items first!");
        return;
    }

    let user_id = localStorage.getItem("user_id");

    let total = Object.values(cart).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    console.log("SENDING TOTAL:", total);

    fetch("http://127.0.0.1:5000/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer_id: user_id,
            order_type: "dine-in",
            items: cart,
            total: total
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Order placed!");

        cart = {};
        updateCart();

        loadOrders();
        showSection("orders");
    });
}

/* LOAD ORDERS */
function loadOrders() {

    let user_id = localStorage.getItem("user_id");

    fetch(`http://127.0.0.1:5000/orders/${user_id}`)
    .then(res => res.json())
    .then(data => {

        let div = document.getElementById("orders-list");
        div.innerHTML = "";

        if (data.length === 0) {
            div.innerHTML = "<p>No orders yet</p>";
            return;
        }

        data.forEach(order => {

            div.innerHTML += `
                <div class="order-card">
                    <h3>Order #${order.id}</h3>
                    <p>Status: <b>${order.status}</b></p>
                    <p>Time: ${order.time_estimate || "Waiting..."}</p>
                    <p>Total: ₹${order.total_amount || 0}</p>
                </div>
            `;
        });
    });
}

/* PAYMENT */
function loadPayment() {

    let user_id = localStorage.getItem("user_id");

    fetch(`http://127.0.0.1:5000/orders/${user_id}`)
    .then(res => res.json())
    .then(data => {

        let billDiv = document.getElementById("payment-section");

        if (data.length === 0) {
            billDiv.innerHTML = "<h3>No orders yet</h3>";
            return;
        }

        let latest = data[0];   // 🔥 latest order

        billDiv.innerHTML = `
            <h1>Bill</h1>

            <div class="payment-box">
                <h3>🧾 Latest Order</h3>

                <p><b>Order ID:</b> ${latest.id}</p>
                <p><b>Status:</b> ${latest.status}</p>

                <h2>Total: ₹${latest.total_amount || 0}</h2>
            </div>
        `;
    });
}

function loadReviews() {

    let reviewsDiv = document.getElementById("reviews-list");

    fetch("http://127.0.0.1:5000/reviews")
    .then(res => res.json())
    .then(data => {

        reviewsDiv.innerHTML = "";

        if (data.length === 0) {
            reviewsDiv.innerHTML = "<p>No reviews yet</p>";
            return;
        }

        data.forEach(r => {
            reviewsDiv.innerHTML += `
                <div class="review-card">
                    <p><b>${r.name}</b></p>
                    <p>${r.comment}</p>
                    <p>Rating: ${"⭐".repeat(r.rating)}</p>
                </div>
            `;
        });
    });
}

function submitReview() {

    let text = document.getElementById("review-text").value;
    let rating = document.getElementById("rating").value;
    let user_id = localStorage.getItem("user_id");

    if (!text) {
        alert("Write something!");
        return;
    }

    fetch("http://127.0.0.1:5000/add_review", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer_id: user_id,
            rating: rating,
            comment: text
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Review added!");

        document.getElementById("review-text").value = "";

        loadReviews();
    });
}

/* NAVIGATION */
function showSection(section, btn) {

    document.getElementById("menu-section").style.display = "none";
    document.getElementById("orders-section").style.display = "none";
    document.getElementById("profile-section").style.display = "none";
    document.getElementById("payment-section").style.display = "none";

    document.getElementById(section + "-section").style.display = "block";

    if (section === "orders") loadOrders();
    if (section === "payment") loadPayment();   // ✅ IMPORTANT
    if (section === "profile") loadProfile();
    if (section === "reviews") loadReviews();

    document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
}

/* LOGOUT */
function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "/";
}
// Auto refresh every 3 seconds
setInterval(() => {
    loadOrders();
}, 3000);