const { Server } = require("socket.io");

const socketAuthMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        chatHandler(socket);
    });

    return io;
};

module.exports = setupSocket;