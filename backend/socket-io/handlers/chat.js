const chatHandler = (socket) => {
    console.log(
        "Authenticated user:",
        socket.user.id
    );

    socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.id
        );
    });
};

module.exports = chatHandler;