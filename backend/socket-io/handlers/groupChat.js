const Group = require("../../models/group");

const checkGroupMember = async (
    groupId,
    userId
) => {
    const group =
        await Group.findByPk(groupId);

    if (!group) {
        return {
            group: null,
            isMember: false
        };
    }

    const isMember =
        await group.hasUser(userId);

    return {
        group,
        isMember
    };
};

const groupChatHandler = (
    socket,
    io
) => {

    socket.on(
        "join_group",
        async (groupId) => {
            try {
                if (!groupId) {
                    return;
                }

                const {
                    group,
                    isMember
                } =
                    await checkGroupMember(
                        groupId,
                        socket.user.id
                    );

                if (!group) {
                    console.log(
                        "Group not found:",
                        groupId
                    );

                    return;
                }

                if (!isMember) {
                    console.log(
                        `User ${socket.user.id} is not a member of group ${groupId}`
                    );

                    return;
                }

                const roomId =
                    `group_${groupId}`;

                socket.join(roomId);

                console.log(
                    `User ${socket.user.id} joined group ${groupId}`
                );

            } catch (error) {
                console.error(
                    "Join group error:",
                    error
                );
            }
        }
    );

    socket.on(
        "leave_group",
        (groupId) => {
            if (!groupId) {
                return;
            }

            const roomId =
                `group_${groupId}`;

            socket.leave(roomId);

            console.log(
                `User ${socket.user.id} left group ${groupId}`
            );
        }
    );

    socket.on(
        "group_message",
        async (data) => {
            try {
                const {
                    groupId,
                    message
                } = data;

                if (
                    !groupId ||
                    !message ||
                    !message.trim()
                ) {
                    return;
                }

                const {
                    group,
                    isMember
                } =
                    await checkGroupMember(
                        groupId,
                        socket.user.id
                    );

                if (!group) {
                    return;
                }

                if (!isMember) {
                    console.log(
                        `User ${socket.user.id} is not a member of group ${groupId}`
                    );

                    return;
                }

                const roomId =
                    `group_${groupId}`;

                io.to(roomId).emit(
                    "group_message",
                    {
                        userId:
                            socket.user.id,

                        message:
                            message.trim(),

                        createdAt:
                            new Date()
                    }
                );

            } catch (error) {
                console.error(
                    "Group message error:",
                    error
                );
            }
        }
    );
};

module.exports =
    groupChatHandler;