const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { Server } = require("socket.io");

const sequelize = require("./config/database");
require("./models/associations");

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);

app.use(
    "/socket.io",
    express.static(
        require.resolve("socket.io-client/dist/socket.io.js")
    )
);

app.use(cors());
app.use(express.json());


app.use("/", userRoutes);
app.use("/", messageRoutes);


/*
    Socket.IO connection
*/

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

    });

});


const PORT = process.env.PORT || 3000;


sequelize
    .authenticate()
    .then(() => {

        console.log("Database connected successfully");

        return sequelize.sync();

    })
    .then(() => {

        console.log("Database tables created successfully");

        server.listen(PORT, () => {

            console.log(`Server is running on port ${PORT}`);

        });

    })
    .catch((error) => {

        console.error(
            "Unable to connect to database:",
            error
        );

    });