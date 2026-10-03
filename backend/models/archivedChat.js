const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");

const ArchivedChat = sequelize.define(
    "ArchivedChat",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

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
            allowNull: true
        },

        messageType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "text"
        },

        mediaKey: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        fileName: {
            type: DataTypes.STRING,
            allowNull: true
        },

        mimeType: {
            type: DataTypes.STRING,
            allowNull: true
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }
);

module.exports = ArchivedChat;