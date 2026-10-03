const express = require("express");

const {
signup,
login,
checkUser
} = require("../controllers/userController");

const authMiddleware =
require("../middleware/authMiddleware");

const router = express.Router();

router.post(
"/signup",
signup
);

router.post(
"/login",
login
);

router.get(
"/users/check",
authMiddleware,
checkUser
);

module.exports = router;
