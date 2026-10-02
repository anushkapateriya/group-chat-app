const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const socket = io(API_URL, {
    auth: {
        token: token
    }
});

const userEmailInput = document.getElementById("userEmail");
const joinRoomButton = document.getElementById("joinRoomButton");

let roomId = null;

joinRoomButton.addEventListener("click", function () {
    const otherUserEmail = userEmailInput.value.trim();

    if (!otherUserEmail) {
        return;
    }

    if (roomId) {
        socket.emit("leave_room", roomId);
    }

    const currentUserId = getCurrentUserIdFromToken();

    roomId = [currentUserId, otherUserEmail]
        .sort()
        .join("_");

    socket.emit("join_room", roomId);

    console.log("Joined room:", roomId);
});

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");

const chatUserName = document.getElementById("chatUserName");
const chatUserStatus = document.getElementById("chatUserStatus");
const chatUserInitial = document.getElementById("chatUserInitial");

/*
Set chat user information
*/

function setChatUser(name, status) {
chatUserName.textContent = name;
chatUserStatus.textContent = status;


if (name) {
    chatUserInitial.textContent = name.charAt(0).toUpperCase();
}


}

/*
Add message to chat window
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


}

/*
Load messages from backend
*/

async function loadMessages() {


const token = localStorage.getItem("token");

if (!token) {
    console.log("Login token not found");
    return;
}


try {

    const response = await axios.get(
        `${API_URL}/messages`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const messages = response.data.data;

    messagesContainer.innerHTML = "";


    messages.forEach(function (item) {

        const messageTime = new Date(
            item.createdAt
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });


        const currentUserId = getCurrentUserIdFromToken();

        const sender =
            item.userId === currentUserId
                ? "user"
                : "other";


        addMessage(
            item.message,
            sender,
            messageTime
        );

    });


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;


} catch (error) {

    if (error.response) {

        console.log(
            "Load messages error:",
            error.response.data.message
        );

    } else {

        console.log("Unable to connect to server");

    }

}


}

/*
Get logged-in user ID from JWT
*/

function getCurrentUserIdFromToken() {


const token = localStorage.getItem("token");

if (!token) {
    return null;
}


try {

    const payload = token.split(".")[1];

    const decodedPayload =
        JSON.parse(atob(payload));


    return decodedPayload.id;

} catch (error) {

    console.log("Unable to read token");

    return null;
}


}

/*
Send message to backend
*/

messageForm.addEventListener(
"submit",
async function (event) {


    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }


    const token = localStorage.getItem("token");

    if (!token) {
        console.log("Login token not found");
        return;
    }


    try {

        const response = await axios.post(
            `${API_URL}/messages`,
            {
                message: message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!roomId) {
            return;
        }

        socket.emit("new_message", {
            roomId: roomId,
            message: message
        });


        messageInput.value = "";

        messageInput.focus();      


        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;


    } catch (error) {

        if (error.response) {

            console.log(
                "Message error:",
                error.response.data.message
            );

        } else {

            console.log(
                "Unable to connect to server"
            );

        }

    }

}


);

/*
Chat user information will be
connected to backend later.
*/

setChatUser("", "");

/*
Load saved messages when page opens.
*/

loadMessages();

/*
Focus message input.
*/

messageInput.focus();

socket.on("newMessage", function (data) {

    const messageTime = new Date(
        data.createdAt
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const currentUserId = getCurrentUserIdFromToken();

    const sender =
        data.userId === currentUserId
            ? "user"
            : "other";

    addMessage(
        data.message,
        sender,
        messageTime
    );

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
});

socket.on("new_message", function (data) {
    const messageTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const currentUserId = getCurrentUserIdFromToken();

    const sender =
        data.userId === currentUserId
            ? "user"
            : "other";

    addMessage(
        data.message,
        sender,
        messageTime
    );

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
});