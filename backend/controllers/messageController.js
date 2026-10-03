const Message = require("../models/message");
const User = require("../models/user");
const Group = require("../models/group");
const { Op } = require("sequelize");

const {
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const s3 =
    require("../config/aws");

const createMessage = async (req, res) => {
    try {
        const {
            message,
            groupId,
            receiverId
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        /*
        Group message
        */
        if (groupId) {
            const group =
                await Group.findByPk(groupId);

            if (!group) {
                return res.status(404).json({
                    message: "Group not found"
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
        Personal message
        */
        if (!groupId) {
            if (!receiverId) {
                return res.status(400).json({
                    message:
                        "Receiver ID is required"
                });
            }

            if (
                Number(receiverId) ===
                Number(req.user.id)
            ) {
                return res.status(400).json({
                    message:
                        "You cannot message yourself"
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

        const newMessage =
            await Message.create({
                userId: req.user.id,

                receiverId:
                    groupId
                        ? null
                        : receiverId,

                groupId:
                    groupId || null,

                message:
                    message.trim()
            });

        return res.status(201).json({
            message:
                "Message sent successfully",

            data: newMessage
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
                "Something went wrong"
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const {
            groupId,
            receiverId
        } = req.query;

        const where = {};

        /*
        Group messages
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

            where.groupId = groupId;

        } else if (receiverId) {

            /*
            Personal messages between
            logged-in user and receiver
            */

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

            where.groupId = null;

            where[Op.or] = [
                {
                    userId:
                        req.user.id,

                    receiverId:
                        receiverId
                },
                {
                    userId:
                        receiverId,

                    receiverId:
                        req.user.id
                }
            ];

        } else {

            /*
            No group or receiver specified
            */
            where.groupId = null;

            where[Op.or] = [
                {
                    userId:
                        req.user.id
                },
                {
                    receiverId:
                        req.user.id
                }
            ];
        }

        const messages =
            await Message.findAll({
                where,

                include: [
                    {
                        model: User,
                        as: "sender",
                        attributes: [
                            "id",
                            "name"
                        ]
                    },
                    {
                        model: User,
                        as: "receiver",
                        attributes: [
                            "id",
                            "name"
                        ]
                    }
                ],

                order: [
                    ["createdAt", "ASC"]
                ]
            });

        const messagesWithMediaUrl =
            await Promise.all(
                messages.map(
                    async (item) => {
                        const messageData =
                            item.toJSON();

                        if (
                            messageData.messageType ===
                                "media" &&
                            messageData.mediaKey
                        ) {
                            const getObjectCommand =
                                new GetObjectCommand({
                                    Bucket:
                                        process.env
                                            .AWS_S3_BUCKET_NAME,

                                    Key:
                                        messageData.mediaKey
                                });

                            messageData.mediaUrl =
                                await getSignedUrl(
                                    s3,
                                    getObjectCommand,
                                    {
                                        expiresIn: 3600
                                    }
                                );
                        }

                        return messageData;
                    }
                )
            );

        return res.status(200).json({
            data:
                messagesWithMediaUrl
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
                "Something went wrong"
        });
    }
};

module.exports = {
    createMessage,
    getMessages
};