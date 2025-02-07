let section = document.querySelector(".sect1");
let hasCart = sessionStorage.getItem("cart");
let currentPage = 1;

async function getProducts(page = 1) {
  try {
    let response = await fetch(
      `https://api.everrest.educata.dev/shop/products/all?page_index=${page}&page_size=25`
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("Error fetching products");
  }
}

async function getCategories() {
  try {
    let response = await fetch("https://api.everrest.educata.dev/shop/products/categories");
    let categories = await response.json();
    let categoryFilter = document.getElementById("categoryFilter");

    categories.forEach(category => {
      let option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name.toUpperCase();
      categoryFilter.appendChild(option);
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}


async function getCategoryById(categoryId) {
  try {
    let response = await fetch(
      `https://api.everrest.educata.dev/shop/products/category/${categoryId}?page_index=${currentPage}&page_size=25`
    );
    let data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
}

async function getBrands() {
  try {
    let response = await fetch("https://api.everrest.educata.dev/shop/products/brands");
    let brands = await response.json();
    let brandFilter = document.getElementById("brandFilter");

    brands.forEach(brand => {
      let option = document.createElement("option");
      option.value = brand.toLowerCase();
      option.textContent = brand.toUpperCase();
      brandFilter.appendChild(option);
    });

    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
  }
}

async function applyFilters() {
  let searchQuery = document.getElementById("searchBar").value.toLowerCase();
  let category = document.getElementById("categoryFilter").value;
  let brand = document.getElementById("brandFilter").value.toLowerCase();
  let minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  let maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  let rating = parseInt(document.getElementById("ratingFilter").value) || 0;

  let filteredProducts = [];

  if (category) {
    filteredProducts = await getCategoryById(category);
  } else {
    let allProducts = await getProducts();
    filteredProducts = allProducts.products || [];
  }

  filteredProducts = filteredProducts.filter(item => {
    return (
      (searchQuery === "" || item.title.toLowerCase().includes(searchQuery)) &&
      (brand === "" || item.brand.toLowerCase() === brand) &&
      (item.price.current >= minPrice && item.price.current <= maxPrice) &&
      (rating === 0 || (item.rating && item.rating >= rating))
    );
  });

  section.innerHTML = "";
  filteredProducts.forEach(item => (section.innerHTML += cardCode(item)));
}


function loadMore() {
  currentPage++;
  getProducts(currentPage).then(data => {
    if (data && data.products.length > 0) {
      data.products.forEach(item => {
        section.innerHTML += cardCode(item);
      });
    } else {
      alert("No more products to load.");
    }
  });
}

function cardCode(item) {
  let imagePhoto = item.images[0]?.startsWith("https://i.imgur.com")
    ? "https://media.istockphoto.com/id/887464786/vector/no-cameras-allowed-sign-flat-icon-in-red-crossed-out-circle-vector.jpg?s=612x612&w=0&k=20&c=LVkPMBiZas8zxBPmhEApCv3UiYjcbYZJsO-CVQjAJeU="
    : item.images[0];

  return `<div class="card" style="width: 18rem;">
    <img src="${imagePhoto}" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title"><a href="productdetails.html?id=${item._id}" class="product-link">${item.title}</a></h5>
      <p class="card-text">${item.description}</p>
      <p class="card-text item-price">${item.price.current} ${item.price.currency}</p>
      <p class="card-text">Stock: ${item.stock}</p>
      <p class="card-text">Rating: ${item.rating}</p>
      <a onclick="addToCart('${item._id}')" class="btn btn-primary">Add to Cart</a>
      <a onclick="deleteFromCart('${item._id}')" class="btn btn-danger">Remove</a>
    </div>
  </div>`;
}

function addToCart(id) {
  fetch("https://api.everrest.educata.dev/shop/cart/product", {
    method: hasCart == "" ? "POST" : "PATCH",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("info")}`,
    },
    body: JSON.stringify({ id: id, quantity: 1 }),
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      hasCart = "cart"
      alert("Added to cart successfully!");
    })
    .catch(error => console.error("Error adding to cart:", error));
}


function deleteFromCart(id) {
  fetch("https://api.everrest.educata.dev/shop/cart/product", {
    method: "DELETE",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("info")}`,
    },
    body: JSON.stringify({ id: id }),
  })
    .then(res => res.json())
    .then(data => {
      console.log("Removed from cart:", data);
      alert ("Removed from cart succesfully!")
    });
}

document.addEventListener("DOMContentLoaded", () => {
  getCategories();
  getBrands();
  getProducts(currentPage).then(data => {
    data.products.forEach(item => (section.innerHTML += cardCode(item)));
  });
});

function toggleSidebar() {
  let sidebar = document.getElementById("sidebar");
  sidebar.style.display = (sidebar.style.display === "none" || sidebar.style.display === "") ? "block" : "none";
}






