const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {
userId: {
type: DataTypes.INTEGER,
allowNull: false
},


message: {
    type: DataTypes.TEXT,
    allowNull: false
}


});

module.exports = Message;
