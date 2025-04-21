import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WebSocketRepository } from "../../repository/Sockets/commentLikeRepo";
import { NotificationSocketRepository } from "../../repository/Sockets/paymentNotificationRepo";

let ioInstance: Server | null = null;
export const onlineUsers = new Map();
const users: { [key: string]: string[] } = {}; // For video rooms

const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    const { userId, role } = socket.handshake.query;
    console.log("User Connected:", { userId, role });

    if (userId) {
      onlineUsers.set(userId, { socketId: socket.id, role });
      io.emit("get-online-users", Array.from(onlineUsers.keys()));
    }

    // 1. Comment Handling
    socket.on('post_comment', async (comment: string, userId: string, postId: string, callback: (response: { comment: string, userName: string } | null) => void) => {
      try {
        const newComment = await WebSocketRepository.addComment(userId, postId, comment);
        io.emit('new_comment', { comment: newComment.comment, userName: newComment.userName, postId });
      } catch (error) {
        console.error("Error handling comment:", error);
        callback(null);
      }
    });

    // 2. Chat Message Handling
    socket.on("post-new-message", async (newMessage, callback) => {
      const { sender, receiver, message } = newMessage;
      console.log("Received message:", newMessage);

      const result = await WebSocketRepository.addNewMessage(newMessage);
      const receiverData = onlineUsers.get(receiver);

      if (receiverData) {
        console.log("Checking the time",result.createdAt);
        
        io.to(receiverData.socketId).emit("receive-message", { senderId: sender, message, timestamp:result.createdAt,totalMessage:result.totalMessage,chatId:result.chatId});
      }

      callback({ success: true, message: "Message delivered successfully!",data:result });
    });
    socket.on("new-badge",async (senderId,callback)=>{
      
      console.log("SenderrrrrId:",senderId);
      
      const result=await WebSocketRepository.calculateUnReadMessage(senderId);
      console.log("Result of Badge:",result);


      

      
    })

    socket.on('post-payment-success', async (newMessage, callback) => {
      const { senderId, receiverId, message } = newMessage;
      const heading = 'Payment Successfully';

      const result = await NotificationSocketRepository.addNewNotification(senderId, receiverId, message, heading);
      const receiverData = onlineUsers.get(receiverId);
      console.log("OnlineUser",onlineUsers);
      console.log("RecieverId:",receiverData);
      
      
      if (receiverData) {
        io.to(receiverData.socketId).emit("receive-notification-message", { senderId, message });
      }

      callback({ success: true, message: "Notification sent successfully!" });
    });


    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      for (const [userId, user] of onlineUsers) {
        if (user.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("get-online-users", Array.from(onlineUsers.keys()));
    });
  });

  ioInstance = io;
  return io;
};

export const getSocketInstance = (): Server | null => ioInstance;
export default initializeSocket;

