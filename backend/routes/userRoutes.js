const express = require("express");
const { signup,
        login,
        checkUser
    } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/users/check", checkUser);

module.exports = router;