const User = require("./user");
const Message = require("./message");
const Group = require("./group");

User.hasMany(Message, {
    foreignKey: "userId"
});

Message.belongsTo(User, {
    foreignKey: "userId"
});

User.belongsToMany(Group, {
    through: "UserGroups",
    foreignKey: "userId"
});

Group.belongsToMany(User, {
    through: "UserGroups",
    foreignKey: "groupId"
});

Group.hasMany(Message, {
    foreignKey: "groupId"
});

Message.belongsTo(Group, {
    foreignKey: "groupId"
});