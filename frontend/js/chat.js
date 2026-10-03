const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const socket = io(API_URL, {
    auth: {
        token: token
    }
});

const userEmailInput =
    document.getElementById("userEmail");

const joinRoomButton =
    document.getElementById("joinRoomButton");

const groupNameInput =
    document.getElementById("groupName");

const createGroupButton =
    document.getElementById("createGroupButton");

const groupIdInput =
    document.getElementById("groupId");

const joinGroupButton =
    document.getElementById("joinGroupButton");

let roomId = null;
let groupId = null;
let receiverId = null;

/*
AI typing suggestion timer
*/

let typingSuggestionTimer = null;

/*
Join personal chat room
*/

joinRoomButton.addEventListener(
    "click",
    async function () {
        const otherUserEmail =
            userEmailInput.value.trim().toLowerCase();

        if (!otherUserEmail) {
            console.log(
                "Please enter an email"
            );
            return;
        }

        messagesContainer.innerHTML = "";

        const currentUserEmail =
            getCurrentUserEmailFromToken();

        if (!currentUserEmail) {
            console.log(
                "Unable to get current user email"
            );
            return;
        }

        if (
            currentUserEmail.toLowerCase() ===
            otherUserEmail
        ) {
            console.log(
                "You cannot chat with yourself"
            );
            return;
        }

        try {
            const response =
                await axios.get(
                    `${API_URL}/users/check`,
                    {
                        params: {
                            email: otherUserEmail
                        },
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            /*
            Leave current group
            */

            if (groupId) {
                socket.emit(
                    "leave_group",
                    groupId
                );

                groupId = null;
            }

            /*
            Leave current personal room
            */

            if (roomId) {
                socket.emit(
                    "leave_room",
                    roomId
                );
            }

            const currentUserEmailLower =
                currentUserEmail.toLowerCase();

            roomId = [
                currentUserEmailLower,
                otherUserEmail
            ]
                .sort()
                .join("_");

            socket.emit(
                "join_room",
                roomId
            );

            /*
            Set receiver before loading messages
            */

            receiverId =
                response.data.userId;

            loadMessages(
                null,
                receiverId
            );

            console.log(
                "Joined room:",
                roomId
            );

            console.log(
                "Chatting with:",
                response.data.email
            );

        } catch (error) {
            if (error.response) {
                console.log(
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
Create group
*/

createGroupButton.addEventListener(
    "click",
    async function () {
        const groupName =
            groupNameInput.value.trim();

        if (!groupName) {
            console.log(
                "Please enter a group name"
            );
            return;
        }

        messagesContainer.innerHTML = "";

        try {
            const response =
                await axios.post(
                    `${API_URL}/groups`,
                    {
                        name: groupName
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const group =
                response.data.group;

            /*
            Leave current personal room
            */

            if (roomId) {
                socket.emit(
                    "leave_room",
                    roomId
                );

                roomId = null;
            }

            /*
            Leave previous group
            */

            if (groupId) {
                socket.emit(
                    "leave_group",
                    groupId
                );
            }

            groupId = group.id;
            receiverId = null;

            socket.emit(
                "join_group",
                groupId
            );

            loadMessages(groupId);

            console.log(
                "Group created:",
                group.name
            );

            console.log(
                "Group ID:",
                group.id
            );

            groupNameInput.value = "";

        } catch (error) {
            if (error.response) {
                console.log(
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
Join group
*/

joinGroupButton.addEventListener(
    "click",
    async function () {
        const enteredGroupId =
            groupIdInput.value.trim();

        if (!enteredGroupId) {
            console.log(
                "Please enter a group ID"
            );
            return;
        }

        messagesContainer.innerHTML = "";

        try {
            const response =
                await axios.post(
                    `${API_URL}/groups/join`,
                    {
                        groupId:
                            enteredGroupId
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const group =
                response.data.group;

            /*
            Leave current personal room
            */

            if (roomId) {
                socket.emit(
                    "leave_room",
                    roomId
                );

                roomId = null;
            }

            /*
            Leave previous group
            */

            if (groupId) {
                socket.emit(
                    "leave_group",
                    groupId
                );
            }

            groupId = group.id;
            receiverId = null;

            socket.emit(
                "join_group",
                groupId
            );

            loadMessages(groupId);

            console.log(
                "Joined group:",
                group.name
            );

            console.log(
                "Group ID:",
                group.id
            );

        } catch (error) {
            if (error.response) {
                console.log(
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

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const messagesContainer =
    document.getElementById(
        "messagesContainer"
    );

const chatUserName =
    document.getElementById(
        "chatUserName"
    );

const chatUserStatus =
    document.getElementById(
        "chatUserStatus"
    );

const chatUserInitial =
    document.getElementById(
        "chatUserInitial"
    );

/*
AI suggestion containers
*/

const typingSuggestions =
    document.getElementById(
        "typingSuggestions"
    );

const smartReplies =
    document.getElementById(
        "smartReplies"
    );

/*
Set chat user information
*/

function setChatUser(
    name,
    status
) {
    chatUserName.textContent = name;
    chatUserStatus.textContent = status;

    if (name) {
        chatUserInitial.textContent =
            name.charAt(0).toUpperCase();
    }
}

/*
Add message to chat window
*/

function addMessage(
    text,
    sender,
    time
) {
    const messageElement =
        document.createElement("div");

    messageElement.classList.add(
        "message"
    );

    if (sender === "user") {
        messageElement.classList.add(
            "sent"
        );
    } else {
        messageElement.classList.add(
            "received"
        );
    }

    const messageContent =
        document.createElement("p");

    messageContent.classList.add(
        "message-content"
    );

    messageContent.textContent = text;

    const messageTime =
        document.createElement("span");

    messageTime.classList.add(
        "message-time"
    );

    messageTime.textContent = time;

    messageElement.appendChild(
        messageContent
    );

    messageElement.appendChild(
        messageTime
    );

    messagesContainer.appendChild(
        messageElement
    );
}

/*
Load saved messages
*/

async function loadMessages(
    selectedGroupId = null,
    selectedReceiverId = null
) {
    const savedToken =
        localStorage.getItem("token");

    if (!savedToken) {
        console.log(
            "Login token not found"
        );
        return;
    }

    try {
        let url =
            `${API_URL}/messages`;

        /*
        Load group messages
        */

        if (selectedGroupId) {
            url +=
                `?groupId=${selectedGroupId}`;
        }

        /*
        Load personal messages
        */

        else if (selectedReceiverId) {
            url +=
                `?receiverId=${selectedReceiverId}`;
        }

        const response =
            await axios.get(
                url,
                {
                    headers: {
                        Authorization:
                            `Bearer ${savedToken}`
                    }
                }
            );

        const messages =
            response.data.data;

        messagesContainer.innerHTML = "";

        messages.forEach(
            function (item) {
                const messageTime =
                    new Date(
                        item.createdAt
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

                const currentUserId =
                    getCurrentUserIdFromToken();

                const sender =
                    item.userId ===
                    currentUserId
                        ? "user"
                        : "other";

                if (
                    item.messageType ===
                    "media"
                ) {
                    addMediaMessage({
                        userId:
                            item.userId,

                        receiverId:
                            item.receiverId,

                        groupId:
                            item.groupId,

                        mediaUrl:
                            item.mediaUrl,

                        fileName:
                            item.fileName,

                        mimeType:
                            item.mimeType,

                        createdAt:
                            item.createdAt
                    });

                    return;
                }

                addMessage(
                    item.message,
                    sender,
                    messageTime
                );
            }
        );

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    } catch (error) {
        if (error.response) {
            console.log(
                "Load messages error:",
                error.response.data.message
            );
        } else {
            console.log(
                "Unable to connect to server"
            );
        }
    }
}

/*
Get logged-in user ID from JWT
*/

function getCurrentUserIdFromToken() {
    const savedToken =
        localStorage.getItem("token");

    if (!savedToken) {
        return null;
    }

    try {
        const payload =
            savedToken.split(".")[1];

        const decodedPayload =
            JSON.parse(
                atob(
                    payload
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return decodedPayload.id;

    } catch (error) {
        console.log(
            "Unable to read token"
        );

        return null;
    }
}

/*
Get logged-in user email from JWT
*/

function getCurrentUserEmailFromToken() {
    const savedToken =
        localStorage.getItem("token");

    if (!savedToken) {
        return null;
    }

    try {
        const payload =
            savedToken.split(".")[1];

        const decodedPayload =
            JSON.parse(
                atob(
                    payload
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return decodedPayload.email;

    } catch (error) {
        console.log(
            "Unable to read token"
        );

        return null;
    }
}

/*
Get AI suggestions
*/

async function getAiSuggestions(
    type,
    message
) {
    try {
        const response =
            await axios.post(
                `${API_URL}/ai/suggestions`,
                {
                    type: type,
                    message: message
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data.suggestions;

    } catch (error) {
        console.error(
            "AI suggestion error:",
            error
        );

        return [];
    }
}

/*
Predictive typing
*/

messageInput.addEventListener(
    "input",
    function () {
        clearTimeout(
            typingSuggestionTimer
        );

        const message =
            messageInput.value.trim();

        typingSuggestions.innerHTML =
            "";

        if (
            message.length < 3
        ) {
            return;
        }

        typingSuggestionTimer =
            setTimeout(
                async function () {
                    const suggestions =
                        await getAiSuggestions(
                            "typing",
                            message
                        );

                    typingSuggestions.innerHTML =
                        "";

                    suggestions.forEach(
                        function (
                            suggestion
                        ) {
                            const button =
                                document.createElement(
                                    "button"
                                );

                            button.type =
                                "button";

                            button.textContent =
                                suggestion;

                            button.addEventListener(
                                "click",
                                function () {
                                    messageInput.value =
                                        `${message} ${suggestion}`;

                                    messageInput.focus();

                                    typingSuggestions.innerHTML =
                                        "";
                                }
                            );

                            typingSuggestions.appendChild(
                                button
                            );
                        }
                    );
                },
                700
            );
    }
);

/*
Send message
*/

messageForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const message =
            messageInput.value.trim();

        if (!message) {
            return;
        }

        const savedToken =
            localStorage.getItem("token");

        if (!savedToken) {
            console.log(
                "Login token not found"
            );
            return;
        }

        /*
        Group chat
        */

        if (groupId) {
            try {
                await axios.post(
                    `${API_URL}/messages`,
                    {
                        message: message,
                        groupId: groupId
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${savedToken}`
                        }
                    }
                );

                socket.emit(
                    "group_message",
                    {
                        groupId: groupId,
                        message: message
                    }
                );

                messageInput.value = "";

                typingSuggestions.innerHTML =
                    "";

                smartReplies.innerHTML =
                    "";

                messageInput.focus();

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

            return;
        }

        /*
        Personal chat
        */

        if (roomId) {
            try {
                await axios.post(
                    `${API_URL}/messages`,
                    {
                        message: message,
                        receiverId: receiverId
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${savedToken}`
                        }
                    }
                );

                socket.emit(
                    "new_message",
                    {
                        roomId: roomId,
                        message: message
                    }
                );

                messageInput.value = "";

                typingSuggestions.innerHTML =
                    "";

                smartReplies.innerHTML =
                    "";

                messageInput.focus();

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

            return;
        }

        /*
        Existing group chat
        */

        try {
            await axios.post(
                `${API_URL}/messages`,
                {
                    message: message
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${savedToken}`
                    }
                }
            );

            messageInput.value = "";

            typingSuggestions.innerHTML =
                "";

            smartReplies.innerHTML =
                "";

            messageInput.focus();

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
Initial chat information
*/

setChatUser("", "");

/*
Focus message input
*/

messageInput.focus();

/*
Existing group-chat event

Only handle this when we are NOT
inside a personal room or group.
*/

socket.on(
    "newMessage",
    function (data) {
        if (roomId || groupId) {
            return;
        }

        const messageTime =
            new Date(
                data.createdAt
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        const currentUserId =
            getCurrentUserIdFromToken();

        const sender =
            data.userId ===
            currentUserId
                ? "user"
                : "other";

        addMessage(
            data.message,
            sender,
            messageTime
        );

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }
);

/*
Personal-chat event
*/

socket.on(
    "new_message",
    function (data) {
        if (!roomId) {
            return;
        }

        const messageTime =
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        const currentUserId =
            getCurrentUserIdFromToken();

        const sender =
            data.userId ===
            currentUserId
                ? "user"
                : "other";

        addMessage(
            data.message,
            sender,
            messageTime
        );

        /*
        Generate smart replies
        for incoming message
        */

        if (
            Number(data.userId) !==
            Number(currentUserId)
        ) {
            getAiSuggestions(
                "reply",
                data.message
            ).then(
                function (
                    suggestions
                ) {
                    smartReplies.innerHTML =
                        "";

                    suggestions.forEach(
                        function (
                            suggestion
                        ) {
                            const button =
                                document.createElement(
                                    "button"
                                );

                            button.type =
                                "button";

                            button.textContent =
                                suggestion;

                            button.addEventListener(
                                "click",
                                function () {
                                    messageInput.value =
                                        suggestion;

                                    messageInput.focus();

                                    smartReplies.innerHTML =
                                        "";
                                }
                            );

                            smartReplies.appendChild(
                                button
                            );
                        }
                    );
                }
            );
        }

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }
);

/*
Group-chat event
*/

socket.on(
    "group_message",
    function (data) {
        if (!groupId) {
            return;
        }

        const messageTime =
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        const currentUserId =
            getCurrentUserIdFromToken();

        const sender =
            data.userId ===
            currentUserId
                ? "user"
                : "other";

        addMessage(
            data.message,
            sender,
            messageTime
        );

        /*
        Generate smart replies
        for incoming group message
        */

        if (
            Number(data.userId) !==
            Number(currentUserId)
        ) {
            getAiSuggestions(
                "reply",
                data.message
            ).then(
                function (
                    suggestions
                ) {
                    smartReplies.innerHTML =
                        "";

                    suggestions.forEach(
                        function (
                            suggestion
                        ) {
                            const button =
                                document.createElement(
                                    "button"
                                );

                            button.type =
                                "button";

                            button.textContent =
                                suggestion;

                            button.addEventListener(
                                "click",
                                function () {
                                    messageInput.value =
                                        suggestion;

                                    messageInput.focus();

                                    smartReplies.innerHTML =
                                        "";
                                }
                            );

                            smartReplies.appendChild(
                                button
                            );
                        }
                    );
                }
            );
        }

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }
);

/*
Media message event
*/

socket.on(
    "media_message",
    function (data) {
        if (
            data.groupId &&
            Number(data.groupId) !==
                Number(groupId)
        ) {
            return;
        }

        if (
            data.receiverId &&
            !roomId
        ) {
            return;
        }

        addMediaMessage(data);
    }
);

const mediaInput =
    document.getElementById(
        "mediaInput"
    );

mediaInput.addEventListener(
    "change",
    async () => {
        try {
            const file =
                mediaInput.files[0];

            if (!file) {
                return;
            }

            if (!roomId && !groupId) {
                mediaInput.value = "";

                console.log(
                    "Please select a chat first"
                );

                return;
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            if (groupId) {
                formData.append(
                    "groupId",
                    groupId
                );
            } else if (receiverId) {
                formData.append(
                    "receiverId",
                    receiverId
                );
            }

            const response =
                await axios.post(
                    `${API_URL}/media/upload`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            console.log(
                "Media uploaded:",
                response.data
            );

            mediaInput.value = "";

        } catch (error) {
            console.error(
                "Media upload error:",
                error
            );

            mediaInput.value = "";
        }
    }
);

/*
Add media message
*/

const addMediaMessage = (
    data
) => {
    const messageElement =
        document.createElement("div");

    messageElement.classList.add(
        "message"
    );

    const currentUserId =
        getCurrentUserIdFromToken();

    if (
        Number(data.userId) ===
        Number(currentUserId)
    ) {
        messageElement.classList.add(
            "sent"
        );
    } else {
        messageElement.classList.add(
            "received"
        );
    }

    if (
        data.mimeType &&
        data.mimeType.startsWith(
            "image/"
        )
    ) {
        const image =
            document.createElement("img");

        image.src =
            data.mediaUrl;

        image.alt =
            data.fileName || "Image";

        image.style.maxWidth =
            "300px";

        image.style.borderRadius =
            "8px";

        messageElement.appendChild(
            image
        );

    } else if (
        data.mimeType &&
        data.mimeType.startsWith(
            "video/"
        )
    ) {
        const video =
            document.createElement("video");

        video.controls = true;

        video.style.maxWidth =
            "300px";

        video.style.borderRadius =
            "8px";

        const source =
            document.createElement("source");

        source.src =
            data.mediaUrl;

        source.type =
            data.mimeType;

        video.appendChild(
            source
        );

        messageElement.appendChild(
            video
        );

    } else {
        const link =
            document.createElement("a");

        link.href =
            data.mediaUrl;

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

        link.textContent =
            data.fileName ||
            "Download file";

        messageElement.appendChild(
            link
        );
    }

    if (data.createdAt) {
        const messageTime =
            document.createElement("span");

        messageTime.classList.add(
            "message-time"
        );

        messageTime.textContent =
            new Date(
                data.createdAt
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        messageElement.appendChild(
            messageTime
        );
    }

    messagesContainer.appendChild(
        messageElement
    );

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
};