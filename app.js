function register(e) {
  e.preventDefault();

  let formArea = new FormData(e.target);
  let finalForm = Object.fromEntries(formArea);

  fetch("https://api.everrest.educata.dev/auth/sign_up", {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalForm),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
}

function login(e) {
  e.preventDefault();

  let formArea = new FormData(e.target);
  let finalForm = Object.fromEntries(formArea);

  fetch("https://api.everrest.educata.dev/auth/sign_in", {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalForm),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      Cookies.set("info", data.access_token);
    });
}

function getUserInfo() {
  fetch("https://api.everrest.educata.dev/auth", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${Cookies.get("info")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data.cartID);
      sessionStorage.setItem("cart", data.cartID )
    });
}

function gotoProducts() {
    window.location.href = "./products.html"
}
