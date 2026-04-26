function login() {
    let name = document.getElementById("name").value;

    if (!name) {
        alert("Enter your name");
        return;
    }

    fetch("http://127.0.0.1:5000/worker/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Login successful");

        localStorage.setItem("worker_id", data.worker_id);

        window.location.href = "/worker";
    })
    .catch(err => console.log(err));
}