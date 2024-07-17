const socketio = require("socket.io");
const { createMessage } = require("../controllers/chat.controller");
const { User } = require("../models/user.model");
const { Message } = require("../models/message.model");
const { Notification } = require("../models/notification.model");

const getMessageCount = async (userId) => {
  // Replace with actual logic to get message count from the database
  const messageCount = await Message.countDocuments({
    receiver: userId,
    seen: false,
  });

  return messageCount;
};

const getNotificationCount = async (userId) => {
  // Replace with actual logic to get notification count from the database
  const notificationCount = await Notification.countDocuments({
    to: userId,
    read: false,
  });
  return notificationCount;
};

const websocket = (io) => {
  // Socket.IO
  io.on("connection", async (socket) => {
    console.log(JSON.stringify(socket.handshake.query));
    const user_id = socket.handshake.query["user_id"];

    if (user_id != null && Boolean(user_id)) {
      try {
        await User.updateOne(
          { _id: user_id },
          {
            $set: {
              socket_id: socket.id,
              is_active: true,
            },
          }
        );
        // io.emit("USER_STATUS", { user_id, is_active: true });
        // Send initial message and notification counts

        const receiverUser = await User.findById(user_id);
        if (receiverUser) {
          const messageCount = await getMessageCount(user_id);
          const notificationCount = await getNotificationCount(user_id);
          io.to(receiverUser.socket_id).emit("COUNTS", {
            messageCount,
            notificationCount,
          });
        }
      } catch (e) {
        console.log(e);
      }
    }

    socket.on("SEND_MESSAGE", async (message) => {
      const { chatId, sender, receiver, content, attachment } = message;
      if (!sender || !receiver || (!content && !attachment)) {
        return;
      }

      const newMsg = await createMessage({
        chatId,
        sender,
        receiver,
        content,
        attachment,
      });

      console.log("Working Here");
      // Emit the new message to the receiver
      const receiverUser = await User.findById(receiver);
      if (receiverUser && receiverUser.socket_id) {
        io.to(receiverUser.socket_id).emit("INCOMING_MESSAGE", {
          sender,
          receiver,
          message: newMsg.message,
          chat_id: newMsg.chat._id,
        });

        // Update message and notification counts for the receiver
        const messageCount = await getMessageCount(receiver);
        const notificationCount = await getNotificationCount(receiver);

        io.to(receiverUser.socket_id).emit("COUNTS", {
          messageCount,
          notificationCount,
        });
      }

      io.emit("INCOMING_MESSAGE", {
        sender,
        receiver,
        message: newMsg.message,
        chat_id: newMsg.chat._id,
      });
    });

    socket.on("SEND_NOTIFICATION", async (notification) => {
      const receiverUser = await User.findById(notification.to);
      if (receiverUser && receiverUser.socket_id) {
        io.emit("INCOMING_NOTIFICATION", notification);
      }
    });

    socket.on("MESSAGE_STATUS_UPDATE", async (message) => {});

    socket.on("MESSAGE_SEEN", async (messageId) => {
      if (!messageId) {
        return;
      }
      const message = await Message.findByIdAndUpdate(messageId, {
        seen: true,
        status: 2,
      });
      console.log("MESSAGE_SEEN -------------> ");
      if (message) {
        io.emit("MESSAGE_SEEN", {
          messageId,
          chatId: message.chatId,
          seen: true,
          status: 2,
        });
      }
    });

    socket.on("disconnect", async (e) => {
      await User.updateOne(
        { _id: user_id },
        {
          $set: {
            socket_id: socket.id,
            is_active: false,
          },
        }
      );
      io.emit("USER_STATUS", { user_id, is_active: false });
    });
  });

  return io;
};

module.exports = websocket;
