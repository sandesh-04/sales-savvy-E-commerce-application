function ensureAdmin() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!token || role !== "ADMIN") {
        window.location.replace("/admin-login.html");
        return false;
    }

    const welcome = document.getElementById("welcomeText");
    if (welcome) {
        welcome.innerText = `Welcome back, ${username || "admin"}`;
    }

    return true;
}

async function loadAdminData() {
    const resultElement = document.getElementById("apiResult");
    const token = localStorage.getItem("token");

    if (!resultElement) return;

    resultElement.innerText = "Testing admin endpoint...";

    try {
        const response = await fetch("/admin/home", {
            headers: {"Authorization": "Bearer " + token}
        });

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        const text = await response.text();
        resultElement.innerText = text || "Admin API responded successfully.";
    } catch (error) {
        resultElement.innerText = "Unable to reach the admin API.";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.replace("/index.html");
}

document.addEventListener("DOMContentLoaded", ensureAdmin);
