const personalChatHandler = (socket) => {

    socket.on("join_room", (roomId) => {
        socket.join(roomId);

        console.log(
            `User ${socket.user.id} joined room ${roomId}`
        );
    });

    socket.on("new_message", (data) => {
        const { roomId, message } = data;

        socket.to(roomId).emit("new_message", {
            userId: socket.user.id,
            message: message
        });
    });

};

module.exports = personalChatHandler;