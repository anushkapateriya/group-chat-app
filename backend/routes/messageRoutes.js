const express = require("express");

const {
createMessage,
getMessages
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
"/messages",
authMiddleware,
createMessage
);

router.get(
"/messages",
authMiddleware,
getMessages
);

module.exports = router;
