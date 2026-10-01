const Message = require("../models/message");
const User = require("../models/user");

const createMessage = async (req, res) => {
try {


    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            message: "Message is required"
        });
    }

    const newMessage = await Message.create({
        userId: req.user.id,
        message: message.trim()
    });

    const io = req.app.get("io");

    io.emit("newMessage", {
        id: newMessage.id,
        userId: newMessage.userId,
        message: newMessage.message,
        createdAt: newMessage.createdAt
    });

    return res.status(201).json({
        message: "Message sent successfully",
        data: newMessage
    });

} catch (error) {

    console.error(error);

    return res.status(500).json({
        message: "Something went wrong"
    });

}


};

const getMessages = async (req, res) => {
try {


    const messages = await Message.findAll({
        include: [
            {
                model: User,
                attributes: ["id", "name"]
            }
        ],
        order: [["createdAt", "ASC"]]
    });

    return res.status(200).json({
        data: messages
    });

} catch (error) {

    console.error(error);

    return res.status(500).json({
        message: "Something went wrong"
    });

}


};

module.exports = {
createMessage,
getMessages
};
