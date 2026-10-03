const { CronJob } = require("cron");

const archiveMessages =
    require("./jobs/archiveMessages");

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
const mediaRoutes = require("./routes/mediaRoutes");
const aiRoutes = require("./routes/aiRoutes");

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
app.use("/", aiRoutes);

const PORT = process.env.PORT || 3000;


sequelize
    .authenticate()
    .then(() => {

        console.log("Database connected successfully");

        return sequelize.sync({alter:true});

    })
    .then(() => {

        console.log("Database tables created successfully");
        
        const archiveJob =
            new CronJob(
                "0 0 * * *",
                async () => {
                    await archiveMessages();
                }
            );

        archiveJob.start();

        console.log(
            "Message archive cron job started"
        );

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