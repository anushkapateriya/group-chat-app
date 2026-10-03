const User = require("./user");
const Message = require("./message");
const Group = require("./group");

/*
User → Messages sent by user
*/

User.hasMany(Message, {
    foreignKey: "userId",
    as: "sentMessages"
});

Message.belongsTo(User, {
    foreignKey: "userId",
    as: "sender"
});

/*
User → Messages received by user
*/

User.hasMany(Message, {
    foreignKey: "receiverId",
    as: "receivedMessages"
});

Message.belongsTo(User, {
    foreignKey: "receiverId",
    as: "receiver"
});

/*
User ↔ Group
*/

User.belongsToMany(Group, {
    through: "UserGroups",
    foreignKey: "userId"
});

Group.belongsToMany(User, {
    through: "UserGroups",
    foreignKey: "groupId"
});

/*
Group → Messages
*/

Group.hasMany(Message, {
    foreignKey: "groupId"
});

Message.belongsTo(Group, {
    foreignKey: "groupId"
});