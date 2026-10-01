const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");

const chatUserName = document.getElementById("chatUserName");
const chatUserStatus = document.getElementById("chatUserStatus");
const chatUserInitial = document.getElementById("chatUserInitial");

/*
Chat user information


Later this information can come from:
- Backend API
- Logged-in user
- Selected group
- Database


*/

function setChatUser(name, status) {
chatUserName.textContent = name;
chatUserStatus.textContent = status;


if (name) {
    chatUserInitial.textContent = name.charAt(0).toUpperCase();
}


}

/*
Add a message to the chat window


This function is ready for real backend messages.

Example data that the backend can provide later:

{
    text: "Hello",
    sender: "user",
    time: "10:30 AM"
}


*/

function addMessage(text, sender, time) {


const messageElement = document.createElement("div");

messageElement.classList.add("message");

if (sender === "user") {
    messageElement.classList.add("sent");
} else {
    messageElement.classList.add("received");
}


const messageContent = document.createElement("p");

messageContent.classList.add("message-content");

messageContent.textContent = text;


const messageTime = document.createElement("span");

messageTime.classList.add("message-time");

messageTime.textContent = time;


messageElement.appendChild(messageContent);
messageElement.appendChild(messageTime);

messagesContainer.appendChild(messageElement);


/*
    Automatically scroll to the newest message.
*/

messagesContainer.scrollTop = messagesContainer.scrollHeight;


}

/*
Send message


For now this only prepares the message.

Later we will replace the console.log with:
    Axios API call
    OR
    Socket.IO message


*/

messageForm.addEventListener("submit", function (event) {


event.preventDefault();

const message = messageInput.value.trim();

if (!message) {
    return;
}


/*
    Backend connection will be added here later.

    Example:

    await axios.post(`${API_URL}/messages`, {
        message: message
    });
*/

console.log("Message ready to send:", message);


messageInput.value = "";

messageInput.focus();


});

/*
Load chat user


No sample user is added here.

Later the actual user/group information
will come from the backend.


*/

setChatUser("", "");

/*
Focus on message input when chat opens.
*/

messageInput.focus();
