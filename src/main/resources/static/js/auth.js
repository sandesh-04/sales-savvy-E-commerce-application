async function parseResponse(response) {
    return await response.json().catch(() => ({}));
}

function showMessage(message, success = false) {
    const element = document.getElementById("message");
    if (!element) return;
    element.innerText = message;
    element.style.color = success ? "var(--success)" : "var(--danger)";
}

async function registerUser(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("name").value.trim(),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await parseResponse(response);

        if (!response.ok) {
            showMessage(result.message || "Registration failed");
            return;
        }

        showMessage(result.message || "Registration successful", true);

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 900);

    } catch (error) {
        showMessage("Unable to connect to the server.");
    }
}

async function loginUser(event, isAdminLogin = false) {
    event.preventDefault();

    const data = {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await parseResponse(response);

        if (!response.ok) {
            showMessage(result.message || "Invalid credentials");
            return;
        }

        if (!result.token) {
            showMessage("Login succeeded but no token was returned.");
            return;
        }

        if (isAdminLogin && result.role !== "ADMIN") {
            showMessage("This account does not have administrator access.");
            return;
        }

        localStorage.setItem("token", result.token);
        localStorage.setItem("username", result.username || data.username);
        localStorage.setItem("role", result.role);

        window.location.href =
            result.role === "ADMIN"
                ? "/admin-home.html"
                : "/customer-home.html";

    } catch (error) {
        showMessage("Unable to connect to the server.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const adminLoginForm = document.getElementById("adminLoginForm");

    if (signupForm) signupForm.addEventListener("submit", registerUser);
    if (loginForm) loginForm.addEventListener("submit", e => loginUser(e, false));
    if (adminLoginForm) adminLoginForm.addEventListener("submit", e => loginUser(e, true));
});
