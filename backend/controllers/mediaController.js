const {
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const crypto = require("crypto");

const s3 =
    require("../config/aws");

const User =
    require("../models/user");

const Group =
    require("../models/group");

const Message =
    require("../models/message");

const uploadMedia = async (
    req,
    res
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message:
                    "File is required"
            });
        }

        const {
            receiverId,
            groupId
        } = req.body;

        if (!receiverId && !groupId) {
            return res.status(400).json({
                message:
                    "Receiver ID or Group ID is required"
            });
        }

        /*
        Group media
        */

        if (groupId) {
            const group =
                await Group.findByPk(
                    groupId
                );

            if (!group) {
                return res.status(404).json({
                    message:
                        "Group not found"
                });
            }

            const isMember =
                await group.hasUser(
                    req.user.id
                );

            if (!isMember) {
                return res.status(403).json({
                    message:
                        "You are not a member of this group"
                });
            }
        }

        /*
        Personal media
        */

        if (receiverId) {
            if (
                Number(receiverId) ===
                Number(req.user.id)
            ) {
                return res.status(400).json({
                    message:
                        "You cannot send media to yourself"
                });
            }

            const receiver =
                await User.findByPk(
                    receiverId
                );

            if (!receiver) {
                return res.status(404).json({
                    message:
                        "Receiver not found"
                });
            }
        }

        const file =
            req.file;

        const fileName =
            `${Date.now()}-${crypto.randomUUID()}-${file.originalname}`;

        const key =
            `media/${fileName}`;

        /*
        Upload file to S3
        */

        const uploadCommand =
            new PutObjectCommand({
                Bucket:
                    process.env.AWS_S3_BUCKET_NAME,

                Key:
                    key,

                Body:
                    file.buffer,

                ContentType:
                    file.mimetype
            });

        await s3.send(
            uploadCommand
        );

        /*
        Save media message in database
        */

        const newMessage =
            await Message.create({
                userId:
                    req.user.id,

                receiverId:
                    receiverId
                        ? Number(receiverId)
                        : null,

                groupId:
                    groupId
                        ? Number(groupId)
                        : null,

                message: null,

                messageType:
                    "media",

                mediaKey:
                    key,

                fileName:
                    file.originalname,

                mimeType:
                    file.mimetype
            });

        /*
        Create temporary URL
        */

        const getObjectCommand =
            new GetObjectCommand({
                Bucket:
                    process.env.AWS_S3_BUCKET_NAME,

                Key:
                    key
            });

        const mediaUrl =
            await getSignedUrl(
                s3,
                getObjectCommand,
                {
                    expiresIn: 3600
                }
            );

        const io =
            req.app.get("io");

        /*
        Group media
        */

        if (groupId) {
            const roomId =
                `group_${groupId}`;

            io.to(roomId).emit(
                "media_message",
                {
                    userId:
                        req.user.id,

                    groupId:
                        Number(groupId),

                    mediaUrl,

                    fileName:
                        file.originalname,

                    mimeType:
                        file.mimetype,

                    createdAt:
                        newMessage.createdAt
                }
            );
        }

        /*
        Personal media
        */

        if (receiverId) {
            const sender =
                await User.findByPk(
                    req.user.id
                );

            const receiver =
                await User.findByPk(
                    receiverId
                );

            const emails = [
                sender.email,
                receiver.email
            ].sort();

            const roomId =
                `${emails[0]}_${emails[1]}`;

            io.to(roomId).emit(
                "media_message",
                {
                    userId:
                        req.user.id,

                    receiverId:
                        Number(receiverId),

                    mediaUrl,

                    fileName:
                        file.originalname,

                    mimeType:
                        file.mimetype,

                    createdAt:
                        newMessage.createdAt
                }
            );
        }

        return res.status(200).json({
            message:
                "File uploaded and shared successfully",

            mediaUrl,

            fileName:
                file.originalname,

            mimeType:
                file.mimetype
        });

    } catch (error) {
        console.error(
            "Media upload error:",
            error
        );

        return res.status(500).json({
            message:
                "File upload failed"
        });
    }
};

module.exports = {
    uploadMedia
};