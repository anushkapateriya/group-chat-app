const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginInput = document.getElementById("loginInput").value;
    const password = document.getElementById("password").value;

    try {
        const response = axios.post(`${API_URL}/login`, {
            loginInput,
            password
        });

        message.textContent = response.data.message;

        localStorage.setItem("token", response.data.token);

    } catch (error) {
        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Unable to connect to server";
        }
    }
});