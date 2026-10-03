const express = require("express");
const multer = require("multer");

const {
    uploadMedia
} = require("../controllers/mediaController");

const authMiddleware =
    require("../middleware/authMiddleware");

const router =
    express.Router();

const upload =
    multer({
        storage:
            multer.memoryStorage(),

        limits: {
            fileSize:
                10 * 1024 * 1024
        }
    });

router.post(
    "/media/upload",
    authMiddleware,
    upload.single("file"),
    uploadMedia
);

module.exports = router;