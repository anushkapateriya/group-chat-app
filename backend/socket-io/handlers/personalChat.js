const personalChatHandler = (
socket,
io
) => {


socket.on("join_room", (roomId) => {

    if (!roomId) {
        return;
    }

    socket.join(roomId);

    console.log(
        `User ${socket.user.id} joined room ${roomId}`
    );
});


socket.on("leave_room", (roomId) => {

    if (!roomId) {
        return;
    }

    socket.leave(roomId);

    console.log(
        `User ${socket.user.id} left room ${roomId}`
    );
});


socket.on("new_message", (data) => {

    const {
        roomId,
        message
    } = data;

    if (
        !roomId ||
        !message ||
        !message.trim()
    ) {
        return;
    }

    io.to(roomId).emit(
        "new_message",
        {
            userId: socket.user.id,
            message: message.trim()
        }
    );
});


};

module.exports = personalChatHandler;
