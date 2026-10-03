const User = require("./user");
const Message = require("./message");
const Group = require("./group");
const ArchivedChat = require("./archivedChat");

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

/*
User → Archived Chats
*/

User.hasMany(ArchivedChat, {
    foreignKey: "userId",
    as: "archivedSentMessages"
});

ArchivedChat.belongsTo(User, {
    foreignKey: "userId",
    as: "sender"
});

/*
Archived Chat → Receiver
*/

User.hasMany(ArchivedChat, {
    foreignKey: "receiverId",
    as: "archivedReceivedMessages"
});

ArchivedChat.belongsTo(User, {
    foreignKey: "receiverId",
    as: "receiver"
});

/*
Group → Archived Chats
*/

Group.hasMany(ArchivedChat, {
    foreignKey: "groupId"
});

ArchivedChat.belongsTo(Group, {
    foreignKey: "groupId"
});