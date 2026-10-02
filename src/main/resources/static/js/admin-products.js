function getToken() {
    return localStorage.getItem("token");
}

function ensureAdminAccess() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
        window.location.replace("/admin-login.html");
        return false;
    }

    return true;
}

function getProductIdFromUrl() {
    return new URLSearchParams(window.location.search).get("id");
}

async function parseJson(response) {
    return await response.json().catch(() => ({}));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.replace("/index.html");
}

function setMessage(text, success = false) {
    const element = document.getElementById("message");
    if (!element) return;
    element.innerText = text;
    element.style.color = success ? "var(--success)" : "var(--danger)";
}

async function addProduct(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        stock: Number(document.getElementById("stock").value),
        category: document.getElementById("category").value.trim(),
        imageUrl: document.getElementById("imageUrl").value.trim()
    };

    try {
        const response = await fetch("/admin/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(data)
        });

        const result = await parseJson(response);

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        if (!response.ok) {
            setMessage(result.message || "Failed to add product");
            return;
        }

        setMessage("Product added successfully.", true);

        setTimeout(() => {
            window.location.href = "/all-products-admin.html";
        }, 700);

    } catch (error) {
        setMessage("Unable to connect to the server.");
    }
}

async function loadAllProducts() {
    const productList = document.getElementById("productList");
    if (!productList) return;

    try {
        const response = await fetch("/admin/products", {
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        const products = await response.json();

        if (!products.length) {
            productList.innerHTML = `
                <div class="empty-state">
                    <h3>No products yet</h3>
                    <p>Create your first product to populate the catalog.</p>
                    <a href="/add-product.html" class="btn btn-primary" style="margin-top:15px;">Add Product</a>
                </div>`;
            return;
        }

        let html = `
            <table class="product-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(product => {
            const stockClass =
                product.stock <= 0 ? "badge-danger" :
                product.stock <= 5 ? "badge-warning" :
                "badge-success";

            const stockText =
                product.stock <= 0 ? "Out of stock" :
                product.stock <= 5 ? `Low: ${product.stock}` :
                `${product.stock} available`;

            html += `
                <tr>
                    <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <img class="product-thumb"
                                 src="${product.imageUrl || ""}"
                                 alt="${product.name}"
                                 onerror="this.style.visibility='hidden'">
                            <div>
                                <strong>${escapeHtml(product.name)}</strong>
                                <div style="font-size:12px;color:var(--muted);">ID #${product.id}</div>
                            </div>
                        </div>
                    </td>
                    <td>₹${Number(product.price).toFixed(2)}</td>
                    <td><span class="badge ${stockClass}">${stockText}</span></td>
                    <td>${escapeHtml(product.category)}</td>
                    <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <a class="btn btn-small btn-secondary" href="/view-product-admin.html?id=${product.id}">View</a>
                            <a class="btn btn-small btn-secondary" href="/edit-product.html?id=${product.id}">Edit</a>
                            <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += "</tbody></table>";
        productList.innerHTML = html;

    } catch (error) {
        productList.innerHTML = `<div class="error-message">Unable to load products.</div>`;
    }
}

async function loadProductDetails() {
    const details = document.getElementById("productDetails");
    const id = getProductIdFromUrl();

    if (!details || !id) return;

    try {
        const response = await fetch(`/admin/products/${id}`, {
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        if (!response.ok) {
            details.innerHTML = `<div class="error-message">Product not found.</div>`;
            return;
        }

        const product = await response.json();

        details.innerHTML = `
            <img src="${product.imageUrl || ""}"
                 alt="${escapeHtml(product.name)}"
                 onerror="this.style.display='none'">

            <div style="text-align:left;max-width:700px;margin:0 auto;">
                <span class="badge badge-info">${escapeHtml(product.category)}</span>
                <h2 style="margin:15px 0 8px;">${escapeHtml(product.name)}</h2>
                <p style="color:var(--muted);margin-bottom:20px;">
                    ${escapeHtml(product.description)}
                </p>

                <div class="summary-row">
                    <span>Product ID</span>
                    <strong>#${product.id}</strong>
                </div>
                <div class="summary-row">
                    <span>Price</span>
                    <strong>₹${Number(product.price).toFixed(2)}</strong>
                </div>
                <div class="summary-row">
                    <span>Stock</span>
                    <strong>${product.stock}</strong>
                </div>

                <div class="form-actions" style="margin-top:20px;">
                    <a class="btn btn-secondary" href="/edit-product.html?id=${product.id}">Edit Product</a>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete Product</button>
                </div>
            </div>
        `;

    } catch (error) {
        details.innerHTML = `<div class="error-message">Unable to load product.</div>`;
    }
}

async function prefillEditForm() {
    const id = getProductIdFromUrl();
    if (!id) return;

    try {
        const response = await fetch(`/admin/products/${id}`, {
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        if (!response.ok) {
            setMessage("Product not found");
            return;
        }

        const product = await response.json();

        document.getElementById("name").value = product.name || "";
        document.getElementById("description").value = product.description || "";
        document.getElementById("price").value = product.price ?? "";
        document.getElementById("stock").value = product.stock ?? "";
        document.getElementById("category").value = product.category || "";
        document.getElementById("imageUrl").value = product.imageUrl || "";

    } catch (error) {
        setMessage("Unable to load product.");
    }
}

async function updateProduct(event) {
    event.preventDefault();

    const id = getProductIdFromUrl();

    const data = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        stock: Number(document.getElementById("stock").value),
        category: document.getElementById("category").value.trim(),
        imageUrl: document.getElementById("imageUrl").value.trim()
    };

    try {
        const response = await fetch(`/admin/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(data)
        });

        const result = await parseJson(response);

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        if (!response.ok) {
            setMessage(result.message || "Failed to update product");
            return;
        }

        setMessage("Product updated successfully.", true);

        setTimeout(() => {
            window.location.href = "/all-products-admin.html";
        }, 700);

    } catch (error) {
        setMessage("Unable to connect to the server.");
    }
}

async function deleteProduct(id) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;

    try {
        const response = await fetch(`/admin/products/${id}`, {
            method: "DELETE",
            headers: {"Authorization": "Bearer " + getToken()}
        });

        const result = await parseJson(response);

        if (response.status === 401 || response.status === 403) {
            window.location.replace("/admin-login.html");
            return;
        }

        if (!response.ok) {
            alert(result.message || "Failed to delete product");
            return;
        }

        alert(result.message || "Product deleted successfully");

        if (document.getElementById("productList")) {
            loadAllProducts();
        } else {
            window.location.href = "/all-products-admin.html";
        }

    } catch (error) {
        alert("Unable to connect to the server.");
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
    if (!ensureAdminAccess()) return;

    const addForm = document.getElementById("addProductForm");
    const editForm = document.getElementById("editProductForm");

    if (addForm) addForm.addEventListener("submit", addProduct);
    if (editForm) {
        prefillEditForm();
        editForm.addEventListener("submit", updateProduct);
    }

    if (document.getElementById("productList")) loadAllProducts();
    if (document.getElementById("productDetails")) loadProductDetails();
});
