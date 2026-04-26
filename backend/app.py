from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from db_config import get_db_connection

app = Flask(__name__)
CORS(app)

@app.route('/')
def login_page():
    return render_template('login.html')

# ================= CUSTOMER LOGIN =================
@app.route('/customer/login', methods=['POST'])
def customer_login():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM customers WHERE phone=%s", (phone,))
    user = cursor.fetchone()

    if not user:
        cursor.execute(
            "INSERT INTO customers (name, phone) VALUES (%s, %s)",
            (name, phone)
        )
        conn.commit()
        user_id = cursor.lastrowid
    else:
        user_id = user['id']

    return jsonify({
        "message": "Login successful",
        "user_id": user_id
    })

# ================= MENU =================
@app.route('/menu', methods=['GET'])
def get_menu():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM menu")
    data = cursor.fetchall()

    return jsonify(data)

# ================= PLACE ORDER =================
@app.route('/order', methods=['POST'])
def place_order():
    try:
        data = request.get_json()

        print("DATA:", data)

        if not data:
            return jsonify({"error": "No data received"}), 400

        customer_id = data.get("customer_id")
        order_type = data.get("order_type")
        items = data.get("items")
        total = data.get("total")

        if not items:
            return jsonify({"error": "No items in order"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # insert order
        cursor.execute("""
            INSERT INTO orders 
            (customer_id, order_type, status, time_estimate, total_amount)
            VALUES (%s, %s, %s, %s, %s)
        """, (customer_id, order_type, "Pending", "Not assigned", total))

        print("TOTAL RECEIVED:", total)

        order_id = cursor.lastrowid

        # insert items
        for key in items:
            item = items[key]

            menu_id = item.get("id")
            qty = item.get("quantity")

            if not menu_id or not qty:
                continue

            cursor.execute("""
                INSERT INTO order_items (order_id, menu_id, quantity)
                VALUES (%s, %s, %s)
            """, (order_id, menu_id, qty))
        

        conn.commit()
        cursor.close()

        return jsonify({
            "message": "Order placed",
            "order_id": order_id
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ================= CUSTOMER DASHBOARD PAGE =================
@app.route('/customer')
def customer_page():
    return render_template('customer.html')

# ================= GET ORDERS =================
@app.route('/orders/<int:customer_id>')
def get_orders(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, status, total_amount 
        FROM orders 
        WHERE customer_id = %s 
        ORDER BY id DESC
    """, (customer_id,))

    orders = cursor.fetchall()

    return jsonify(orders)

# ================= GET PROFILE =================
@app.route('/get_profile/<int:user_id>')
def get_profile(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM customers WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    return jsonify(user)


# ================= UPDATE PROFILE =================
@app.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE customers SET name=%s WHERE id=%s",
        (name, user_id)
    )
    conn.commit()

    return jsonify({"message": "Profile updated"})

@app.route('/payment', methods=['POST'])
def payment():
    data = request.json

    customer_id = data.get('customer_id')
    amount = data.get('amount')
    method = data.get('method')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO payments (customer_id, amount, method) VALUES (%s, %s, %s)",
        (customer_id, amount, method)
    )

    conn.commit()

    return jsonify({"message": "Payment successful"})

@app.route('/add_review', methods=['POST'])
def add_review():
    data = request.json

    customer_id = data.get('customer_id')
    rating = data.get('rating')
    comment = data.get('comment')

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO reviews (customer_id, rating, comment)
        VALUES (%s, %s, %s)
    """, (customer_id, rating, comment))

    conn.commit()

    return jsonify({"message": "Review added"})

@app.route('/reviews', methods=['GET'])
def get_reviews():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT r.*, c.name 
        FROM reviews r
        JOIN customers c ON r.customer_id = c.id
        ORDER BY r.id DESC
    """)

    data = cursor.fetchall()

    return jsonify(data)

@app.route('/worker/login', methods=['POST'])
def worker_login():
    data = request.json
    name = data.get("name")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM workers WHERE name=%s", (name,))
    worker = cursor.fetchone()

    if not worker:
        return jsonify({"error": "Worker not found"}), 404

    return jsonify({
        "message": "Login successful",
        "worker_id": worker["id"],
        "name": worker["name"],
        "role": worker["role"]
    })

@app.route('/worker/orders', methods=['GET'])
def worker_orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT o.id, o.status, o.time_estimate, o.total_amount, c.name
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.id DESC
    """)

    data = cursor.fetchall()
    return jsonify(data)

@app.route('/worker/update_order', methods=['POST'])
def update_order():
    data = request.json

    order_id = data.get("order_id")
    status = data.get("status")
    time = data.get("time_estimate")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE orders 
        SET status=%s, time_estimate=%s 
        WHERE id=%s
    """, (status, time, order_id))

    conn.commit()

    return jsonify({"message": "Order updated"})

@app.route('/worker')
def worker_page():
    return render_template('worker.html')

@app.route('/worker-login')
def worker_login_page():
    return render_template('worker_login.html')

if __name__ == '__main__':
    app.run(debug=True)