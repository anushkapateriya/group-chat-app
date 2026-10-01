const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
event.preventDefault();


const loginInput = document.getElementById("loginInput").value.trim();
const password = document.getElementById("password").value;

try {

    const response = await axios.post(
        `${API_URL}/login`,
        {
            loginInput,
            password
        }
    );


    /*
        Save JWT token
    */

    localStorage.setItem(
        "token",
        response.data.token
    );


    /*
        Redirect to chat page
        after successful login.
    */

    window.location.href = "chat.html";


} catch (error) {

    if (error.response) {

        message.textContent =
            error.response.data.message;

    } else {

        message.textContent =
            "Unable to connect to server";

    }

}


});
