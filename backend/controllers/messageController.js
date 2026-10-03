const Message = require("../models/message");
const User = require("../models/user");
const Group = require("../models/group");

const createMessage = async (req, res) => {
    try {
        const {
            message,
            groupId
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        /*
        Check group membership
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

        const newMessage =
            await Message.create({
                userId: req.user.id,
                groupId: groupId || null,
                message: message.trim()
            });

        const io =
            req.app.get("io");

        /*
        Send global message only when
        it is not a group message.
        */
        if (!groupId) {
            io.emit(
                "newMessage",
                {
                    id: newMessage.id,
                    userId:
                        newMessage.userId,
                    message:
                        newMessage.message,
                    createdAt:
                        newMessage.createdAt
                }
            );
        }

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
        const { groupId } =
            req.query;

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

        } else {

            /*
            Messages that are not
            connected to a group
            */
            where.groupId = null;
        }

        const messages =
            await Message.findAll({
                where,

                include: [
                    {
                        model: User,
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

        return res.status(200).json({
            data: messages
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