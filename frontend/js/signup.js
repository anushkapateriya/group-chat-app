const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post(`${API_URL}/signup`, {
            name,
            email,
            phone,
            password
        });

        message.textContent = response.data.message;

        signupForm.reset();

    } catch (error) {
        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Unable to connect to server";
        }
    }
});