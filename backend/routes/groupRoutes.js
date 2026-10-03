const express = require("express");

const {
    createGroup,
    joinGroup
} = require("../controllers/groupController");

const authMiddleware =
    require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/groups",
    authMiddleware,
    createGroup
);

router.post(
    "/groups/join",
    authMiddleware,
    joinGroup
);

module.exports = router;