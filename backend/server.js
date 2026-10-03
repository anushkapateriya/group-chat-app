const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const setupSocket = require("./socket-io");

const sequelize = require("./config/database");
require("./models/associations");

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const mediaRoutes =require("./routes/mediaRoutes");

const app = express();
const server = http.createServer(app);

const io = setupSocket(server);

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
app.use("/", groupRoutes);
app.use("/", mediaRoutes);


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