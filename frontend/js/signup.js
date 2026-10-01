const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", function (event) {
event.preventDefault();


const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const phone = document.getElementById("phone").value;
const password = document.getElementById("password").value;

console.log("Name:", name);
console.log("Email:", email);
console.log("Phone:", phone);
console.log("Password:", password);

message.textContent = "Signup form submitted successfully.";


});
