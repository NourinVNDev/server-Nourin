

import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WebSocketRepository } from "../../repository/Sockets/commentLikeRepo";

const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Ensure no spaces
      methods: ["GET", "POST"],
    },
  });

  // Store online users
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    const { userId, role } = socket.handshake.query;
    console.log("User Connected:", { userId, role });

    if (userId) {
      onlineUsers.set(userId, { socketId: socket.id, role });
      io.emit("get-online-users", Array.from(onlineUsers.keys())); // Notify all users
    }

        socket.on('post_comment', async (comment: string, userId: string, postId: string, callback: (response: { comment: string, userName: string } | null) => void) => {
      try {
        const newComment = await WebSocketRepository.addComment(userId, postId, comment);
        // callback({ comment: newComment.comment, userName: newComment.userName });
        
        // Optionally, broadcast the new comment to all connected clients (or to specific clients)
        io.emit('new_comment', { comment: newComment.comment, userName: newComment.userName, postId });
      } catch (error) {
        console.error("Error handling comment:", error);
        callback(null);
      }
    });
    

    // Handle sending messages  chat
    socket.on("post-new-message", (newMessage, callback) => {
      console.log("Received message:", newMessage);
      const { userId, managerId, message } = newMessage; // Ensure correct names
      console.log(`Message from ${userId} to ${managerId}:`, message);
      const receiver = onlineUsers.get(managerId);
      if (receiver) {
        io.to(receiver.socketId).emit("receive-message", { senderId: userId, message });
      }
      callback({ success: true, message: "Message delivered successfully!" });
    });
    

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [userId, user] of onlineUsers) {
        if (user.socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("get-online-users", Array.from(onlineUsers.keys())); // Update online users
    });
  });

  return io;
};

export default initializeSocket;
