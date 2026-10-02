let allProducts = [];

function getToken() {
    return localStorage.getItem("token");
}

function ensureCustomer() {
    const token = getToken();
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!token || role !== "USER") {
        window.location.replace("/login.html");
        return false;
    }

    const welcome = document.getElementById("welcomeText");
    if (welcome) welcome.innerText = `Welcome, ${username || "Customer"}`;

    return true;
}

function goToCart() {
    window.location.href = "/view-cart.html";
}

function goBackToShopping() {
    window.location.href = "/customer-home.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.replace("/index.html");
}

function showToast(message, success = true) {
    const old = document.querySelector(".toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    if (!success) toast.style.background = "var(--danger)";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2500);
}

async function loadProducts() {
    const productList = document.getElementById("productList");
    if (!productList) return;

    productList.innerHTML = `<div class="loading">Loading products...</div>`;

    try {
        const response = await fetch("/products", {
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            productList.innerHTML = `<div class="error-message">Unable to load products.</div>`;
            return;
        }

        allProducts = await response.json();
        renderProducts(allProducts);

    } catch (error) {
        productList.innerHTML = `<div class="error-message">Unable to connect to the server.</div>`;
    }
}

function renderProducts(products) {
    const productList = document.getElementById("productList");

    if (!products.length) {
        productList.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Try another search.</p>
            </div>`;
        return;
    }

    productList.innerHTML = products.map(product => {
        const stockLabel =
            product.stock <= 0 ? "Out of stock" :
            product.stock <= 5 ? `Only ${product.stock} left` :
            `${product.stock} in stock`;

        const stockClass =
            product.stock <= 0 ? "badge-danger" :
            product.stock <= 5 ? "badge-warning" :
            "badge-success";

        return `
            <article class="product-card">
                <img class="product-image"
                     src="${product.imageUrl || ""}"
                     alt="${escapeHtml(product.name)}"
                     onerror="this.style.display='none'">

                <div class="product-info">
                    <div class="product-category">${escapeHtml(product.category)}</div>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-description">${escapeHtml(product.description)}</p>

                    <div style="margin-bottom:15px;">
                        <span class="badge ${stockClass}">${stockLabel}</span>
                    </div>

                    <div class="product-bottom">
                        <div class="product-price">₹${Number(product.price).toFixed(2)}</div>
                        <button class="btn btn-primary btn-small"
                                ${product.stock <= 0 ? "disabled" : ""}
                                onclick="addToCart(${product.id})">
                            ${product.stock <= 0 ? "Unavailable" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function addToCart(productId) {
    try {
        const response = await fetch("/customer/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({productId, quantity: 1})
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            showToast(result.message || "Failed to add product", false);
            return;
        }

        showToast(result.message || "Product added to cart");

    } catch (error) {
        showToast("Unable to connect to the server.", false);
    }
}

async function loadCart() {
    const cartList = document.getElementById("cartList");
    if (!cartList) return;

    try {
        const response = await fetch("/customer/cart", {
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            cartList.innerHTML = `<div class="error-message">Unable to load your cart.</div>`;
            return;
        }

        const cart = await response.json();
        renderCart(cart);

    } catch (error) {
        cartList.innerHTML = `<div class="error-message">Unable to connect to the server.</div>`;
    }
}

function renderCart(cart) {
    const cartList = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");
    const cartItemCount = document.getElementById("cartItemCount");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const items = cart.items || [];

    if (cartItemCount) {
        cartItemCount.innerText = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    }

    if (!items.length) {
        cartList.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty</h3>
                <p>Add products to your cart and they will appear here.</p>
                <a href="/customer-home.html" class="btn btn-primary" style="margin-top:15px;">Start Shopping</a>
            </div>`;

        if (cartTotal) cartTotal.innerText = "₹0.00";
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }

    if (checkoutBtn) checkoutBtn.style.display = "inline-flex";

    cartList.innerHTML = items.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl || ""}"
                 alt="${escapeHtml(item.productName)}"
                 onerror="this.style.visibility='hidden'">

            <div>
                <h3>${escapeHtml(item.productName)}</h3>
                <p>${escapeHtml(item.category || "")}</p>
                <p>₹${Number(item.price).toFixed(2)} each</p>

                <div class="quantity-control">
                    <button onclick="changeQuantity(${item.cartItemId}, ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.cartItemId}, ${item.quantity + 1})">+</button>
                </div>
            </div>

            <div>
                <div class="cart-price">₹${Number(item.subtotal).toFixed(2)}</div>
                <button class="btn btn-small btn-danger" style="margin-top:10px;"
                        onclick="removeCartItem(${item.cartItemId})">
                    Remove
                </button>
            </div>
        </div>
    `).join("");

    if (cartTotal) {
        cartTotal.innerText = `₹${Number(cart.totalAmount).toFixed(2)}`;
    }
}

async function changeQuantity(cartItemId, quantity) {
    if (quantity < 1) {
        removeCartItem(cartItemId);
        return;
    }

    await updateCartItem(cartItemId, quantity);
}

async function updateCartItem(cartItemId, quantity) {
    try {
        const response = await fetch(`/customer/cart/${cartItemId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({quantity: Number(quantity)})
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            showToast(result.message || "Failed to update cart", false);
            return;
        }

        await loadCart();

    } catch (error) {
        showToast("Unable to connect to the server.", false);
    }
}

async function removeCartItem(cartItemId) {
    if (!confirm("Remove this item from your cart?")) return;

    try {
        const response = await fetch(`/customer/cart/${cartItemId}`, {
            method: "DELETE",
            headers: {"Authorization": "Bearer " + getToken()}
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            showToast(result.message || "Failed to remove item", false);
            return;
        }

        showToast(result.message || "Item removed");
        await loadCart();

    } catch (error) {
        showToast("Unable to connect to the server.", false);
    }
}

async function checkout() {
    if (typeof Razorpay === "undefined") {
        showToast("Razorpay SDK is not loaded.", false);
        return;
    }

    const button = document.getElementById("checkoutBtn");
    if (button) button.disabled = true;

    try {
        const response = await fetch("/customer/payment/create-order", {
            method: "POST",
            headers: {"Authorization": "Bearer " + getToken()}
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const orderData = await response.json().catch(() => ({}));

        if (!response.ok) {
            showToast(orderData.message || "Failed to create payment order", false);
            return;
        }

        const username = localStorage.getItem("username") || "Customer";

        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "SalesSavvy",
            description: "SalesSavvy Cart Payment",
            order_id: orderData.razorpayOrderId,
            handler: async function(paymentResponse) {
                const verifyResponse = await fetch("/customer/payment/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + getToken()
                    },
                    body: JSON.stringify({
                        localOrderId: orderData.localOrderId,
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpayOrderId: paymentResponse.razorpay_order_id,
                        razorpaySignature: paymentResponse.razorpay_signature
                    })
                });

                const result = await verifyResponse.json().catch(() => ({}));

                if (!verifyResponse.ok) {
                    showToast(result.message || "Payment verification failed", false);
                    return;
                }

                showToast(result.message || "Payment successful");

                setTimeout(() => {
                    window.location.href = "/customer-home.html";
                }, 900);
            },
            prefill: {name: username},
            theme: {color: "#2563eb"}
        };

        const razorpay = new Razorpay(options);

        razorpay.on("payment.failed", function() {
            showToast("Payment failed. Please try again.", false);
            if (button) button.disabled = false;
        });

        razorpay.open();

    } catch (error) {
        showToast("Unable to connect to the payment service.", false);
        if (button) button.disabled = false;
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
    if (!ensureCustomer()) return;

    const search = document.getElementById("productSearch");

    if (search) {
        search.addEventListener("input", () => {
            const query = search.value.trim().toLowerCase();

            const filtered = allProducts.filter(product =>
                String(product.name).toLowerCase().includes(query) ||
                String(product.category).toLowerCase().includes(query) ||
                String(product.description).toLowerCase().includes(query)
            );

            renderProducts(filtered);
        });

        loadProducts();
    }

    if (document.getElementById("cartList")) {
        loadCart();
    }
});
