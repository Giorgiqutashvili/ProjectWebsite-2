let cartContainer = document.getElementById("cart-items");
let totalPriceElement = document.getElementById("total-price");

async function fetchCart() {
    try {
        let response = await fetch("https://api.everrest.educata.dev/shop/cart", {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${Cookies.get("info")}`
            }
        });

        let data = await response.json();

        if (response.status === 401) {
            alert("Unauthorized! Please log in.");
            return;
        }

        console.log("Cart data:", data); 

        
        if (data.products && data.products.length > 0) {
            await fetchProductDetails(data.products);
        } else {
            displayCart([]); 
        }
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

async function fetchProductDetails(cartItems) {
    try {
        let detailedProducts = await Promise.all(cartItems.map(async (item) => {
            if (!item.productId) {
                console.error("Invalid cart item, missing productId:", item);
                return null;
            }

            let response = await fetch(`https://api.everrest.educata.dev/shop/products/id/${item.productId}`, {
                headers: { accept: "application/json" }
            });

            let productData = await response.json();

            if (!productData || !productData._id) {
                console.error("Invalid product response:", productData);
                return null;
            }

            return {
                id: item.productId,
                name: productData.title || "Unknown Product",
                price: productData.price?.current || 0,
                currency: productData.price?.currency || "USD",
                stock: productData.stock || 0,
                rating: productData.rating || "N/A",
                reviews: productData.reviews || "No reviews",
                image: productData.images?.[0] || "https://via.placeholder.com/150",
                quantity: item.quantity
            };
        }));

        
        displayCart(detailedProducts.filter(item => item !== null));
    } catch (error) {
        console.error("Error fetching product details:", error);
    }
}

function displayCart(products) {
    cartContainer.innerHTML = "";
    let totalUSD = 0;
    let totalGEL = 0;

    if (products.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalPriceElement.innerText = "Total USD: 0, Total GEL: 0";
        return;
    }

    products.forEach(item => {
        if (!item.id) {
            console.error("Skipping product with missing ID:", item);
            return;
        }

        if (item.currency === "USD") {
            totalUSD += item.price * item.quantity;
        } else if (item.currency === "GEL") {
            totalGEL += item.price * item.quantity;
        }

        let imagePhoto = item.image?.startsWith("https://i.imgur.com")
            ? "https://media.istockphoto.com/id/887464786/vector/no-cameras-allowed-sign-flat-icon-in-red-crossed-out-circle-vector.jpg?s=612x612&w=0&k=20&c=LVkPMBiZas8zxBPmhEApCv3UiYjcbYZJsO-CVQjAJeU="
            : item.image;

        let cartItem = document.createElement("div");
        cartItem.classList.add("col-md-4", "mb-3");
        cartItem.innerHTML = `
            <div class="card">
                <img src="${imagePhoto}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p>Stock: ${item.stock}</p>
                    <p>Rating: ${item.rating}</p>
                    <p>Price: ${item.price} ${item.currency}</p>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn btn-danger mt-2" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    totalPriceElement.innerText = `Total USD: ${totalUSD.toFixed(2)}, Total GEL: ${totalGEL.toFixed(2)}`;
}


async function updateQuantity(id, newQuantity) {
    if (!id || newQuantity < 1) {
        console.error("Invalid product ID or quantity:", { id, newQuantity });
        return;
    }

    try {
        let response = await fetch("https://api.everrest.educata.dev/shop/cart/product", {
            method: "PATCH",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("info")}`
            },
            body: JSON.stringify({ id, quantity: newQuantity })
        });

        let data = await response.json();
        console.log("Updated quantity response:", data);

        fetchCart();
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

async function removeFromCart(id) {
    if (!id) {
        console.error("Invalid product ID:", id);
        return;
    }

    try {
        let response = await fetch("https://api.everrest.educata.dev/shop/cart/product", {
            method: "DELETE",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("info")}`
            },
            body: JSON.stringify({ id })
        });

        let data = await response.json();
        console.log("Removed from cart:", data);

        fetchCart();
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

async function checkout() {
    try {
        let response = await fetch("https://api.everrest.educata.dev/shop/cart/checkout", {
            method: "POST",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${Cookies.get("info")}`
            }
        });

        let data = await response.json();

        if (response.ok) {
            alert("Checkout successful!");
            fetchCart();
            hasCart = ""
        } else {
            alert("Checkout failed: " + data.error);
        }
    } catch (error) {
        console.error("Error during checkout:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchCart);