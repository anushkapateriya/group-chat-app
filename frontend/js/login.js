
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const loginInput = document.getElementById("loginInput").value;
    const password = document.getElementById("password").value;

    console.log("Email or Phone:", loginInput);
    console.log("Password:", password);

    message.textContent = "Login form submitted successfully.";

});

