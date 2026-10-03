const Group = require("../models/group");
const User = require("../models/user");

const createGroup = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Group name is required"
            });
        }

        const groupName = name.trim();

        const existingGroup =
            await Group.findOne({
                where: {
                    name: groupName
                }
            });

        if (existingGroup) {
            return res.status(400).json({
                message: "Group name already exists"
            });
        }

        const group = await Group.create({
            name: groupName
        });

        const user =
            await User.findByPk(req.user.id);

        await group.addUser(user);

        return res.status(201).json({
            message: "Group created successfully",
            group: {
                id: group.id,
                name: group.name
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};


const joinGroup = async (req, res) => {
    try {
        const { groupName } = req.body;

        if (!groupName || !groupName.trim()) {
            return res.status(400).json({
                message: "Group name is required"
            });
        }

        const group =
            await Group.findOne({
                where: {
                    name: groupName.trim()
                }
            });

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const user =
            await User.findByPk(req.user.id);

        await group.addUser(user);

        return res.status(200).json({
            message: "Joined group successfully",
            group: {
                id: group.id,
                name: group.name
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};


module.exports = {
    createGroup,
    joinGroup
};