const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");

const Message = sequelize.define("Message", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = Message;