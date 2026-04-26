const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aqsa@1702',
    database: 'restaurant_db'
});

db.connect(err => {
    if (err) {
        console.log("DB Connection Failed", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// TEST API
app.get('/', (req, res) => {
    res.send("Server Running ✅");
});

// LOGIN API
app.post('/login', (req, res) => {
    const { name, phone } = req.body;

    const sql = "SELECT * FROM Customer WHERE name=? AND phone=?";

    db.query(sql, [name, phone], (err, result) => {
        if (result.length > 0) {
            res.json({ success: true, user: result[0] });
        } else {
            res.json({ success: false });
        }
    });
});

// GET MENU
app.get('/menu', (req, res) => {
    db.query("SELECT * FROM Menu", (err, result) => {
        res.json(result);
    });
});

// GET ORDERS
app.get('/orders/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT Customer.name, Orders.order_status, Orders.total_amount
        FROM Customer
        JOIN Orders ON Customer.customer_id = Orders.customer_id
        WHERE Customer.customer_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        res.json(result);
    });
});

// CREATE ORDER
app.post('/order', (req, res) => {
    const { customer_id, total } = req.body;

    const sql = "INSERT INTO Orders (customer_id, order_status, total_amount) VALUES (?, 'Preparing', ?)";

    db.query(sql, [customer_id, total], (err, result) => {
        res.json({ message: "Order placed!" });
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000 🚀");
});