document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (productId && isValidMongoId(productId)) {
        await fetchProductDetails(productId);
    } else {
        console.error("Invalid or missing product ID");
        alert("Invalid product ID");
    }
});


function isValidMongoId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}


async function fetchProductDetails(productId) {
    try {
        let response = await fetch(`https://api.everrest.educata.dev/shop/products/id/${productId}`, {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        let product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error("Error fetching product details:", error);
        alert(`Error: ${error.message}`);
    }
}


function displayProductDetails(item) {
    let productContainer = document.getElementById("product-container");

    let imagePhoto = item.images[0]?.startsWith("https://i.imgur.com")
    ? "https://media.istockphoto.com/id/887464786/vector/no-cameras-allowed-sign-flat-icon-in-red-crossed-out-circle-vector.jpg?s=612x612&w=0&k=20&c=LVkPMBiZas8zxBPmhEApCv3UiYjcbYZJsO-CVQjAJeU="
    : item.images[0];

    productContainer.innerHTML = `
      <div class="product-card">
        <img src="${imagePhoto}" alt="Product Image">
        <h1 class"title">${item.title}</h1>
        <h3 class"desc">${item.description}</h3>
        <h2 class"price">Price: ${item.price.current} ${item.price.currency}</h2>
        <h2 class"stock">Stock: ${item.stock}</h2>
        <h2 class"rating">Rating: ${item.rating}</h2>
        <h2 class"warranty">Warranty: ${item.warranty} Year(s)</h2>
        <h4 class"release-date">Release Date: ${item.issueDate}</h1>
        <button class"rate" onclick="openRatingModal()">Rate Product</button>
        <button class"addtocart" onclick="addToCart('${item._id}')">Add to Cart</button>
      </div>
    `;
}


let hasCart = sessionStorage.getItem("cart");

function addToCart(id) {
    fetch("https://api.everrest.educata.dev/shop/cart/product", {
        method: hasCart == "" ? "POST" : "PATCH",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("info")}`,
        },
        body: JSON.stringify({ id: id, quantity: 1 }),
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        hasCart = "has";
        alert("Product added in the cart succesfully.");
        
    })
    .catch(error => {
        console.error("Error adding to cart:", error);
        alert("Error: Unable to add to cart.");
    });
}



function openRatingModal() {
    document.getElementById("ratingModal").style.display = "block";
}

function closeModal() {
    document.getElementById("ratingModal").style.display = "none";
}


let selectedRating = 5;

document.addEventListener("DOMContentLoaded", () => {
    let stars = document.querySelectorAll(".star");
    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            selectedRating = index + 1;
            updateStarRating(selectedRating);
        });
    });
});


function updateStarRating(rating) {
    let stars = document.querySelectorAll(".star");
    stars.forEach((star, index) => {
        star.style.color = index < rating ? "gold" : "gray";
    });
}


async function submitRating() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    if (!firstName || !lastName) {
        alert("Please enter your first and last name before submitting a rating.");
        return;
    }

    try {
        let response = await fetch("https://api.everrest.educata.dev/shop/products/rate", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Cookies.get("info")}`
            },
            body: JSON.stringify({
                productId: productId,
                firstName: firstName,
                lastName: lastName,
                rate: selectedRating
            })
        });

        if (response.ok) {
            alert("Rating submitted successfully!");
        } else {
            let data = await response.json();
            throw new Error(data.error || "Failed to submit rating");
        }
    } catch (error) {
        console.error("Error submitting rating:", error);
        alert(`Error: ${error.message}`);
    }

    closeModal();
}




