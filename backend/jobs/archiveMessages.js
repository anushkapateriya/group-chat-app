const { Op } = require("sequelize");

const Message =
    require("../models/message");

const ArchivedChat =
    require("../models/archivedChat");

const archiveMessages = async () => {
    try {
        const oneDayAgo =
            new Date(
                Date.now() -
                24 * 60 * 60 * 1000
            );

        const oldMessages =
            await Message.findAll({
                where: {
                    createdAt: {
                        [Op.lt]: oneDayAgo
                    }
                }
            });

        if (oldMessages.length === 0) {
            console.log(
                "No messages to archive"
            );

            return;
        }

        const archivedMessages =
            oldMessages.map(
                (message) => ({
                    userId:
                        message.userId,

                    receiverId:
                        message.receiverId,

                    groupId:
                        message.groupId,

                    message:
                        message.message,

                    messageType:
                        message.messageType,

                    mediaKey:
                        message.mediaKey,

                    fileName:
                        message.fileName,

                    mimeType:
                        message.mimeType,

                    createdAt:
                        message.createdAt,

                    updatedAt:
                        message.updatedAt
                })
            );

        await ArchivedChat.bulkCreate(
            archivedMessages
        );

        await Message.destroy({
            where: {
                id: {
                    [Op.in]:
                        oldMessages.map(
                            (message) =>
                                message.id
                        )
                }
            }
        });

        console.log(
            `${oldMessages.length} messages archived successfully`
        );

    } catch (error) {
        console.error(
            "Message archive error:",
            error
        );
    }
};

module.exports =
    archiveMessages;