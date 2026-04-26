function login() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    if (!name || !phone) {
        alert("Enter details");
        return;
    }

    fetch("http://127.0.0.1:5000/customer/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, phone })
    })
    .then(res => res.json())
    .then(data => {
        // STORE USER ID
        localStorage.setItem("user_id", data.user_id);

        // REDIRECT TO DASHBOARD
        window.location.href = "http://127.0.0.1:5000/customer";
    })
    .catch(err => console.log(err));
}

// after all functions

window.onload = function() {

    document.getElementById("role").addEventListener("change", function() {

        let role = this.value;
        let phoneInput = document.getElementById("phone");

        if (role === "worker") {
            phoneInput.style.display = "none";
        } else {
            phoneInput.style.display = "block";
        }
    });

};