const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./models/user");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", userRoutes);


sequelize
    .authenticate()
    .then(() => {
        console.log("Database connected successfully");

        return sequelize.sync();
    })
    .then(() => {
        console.log("Database tables created successfully");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Unable to connect to database:", error);
    });