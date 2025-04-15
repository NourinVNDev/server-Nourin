

import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WebSocketRepository } from "../../repository/Sockets/commentLikeRepo";
import { timeStamp } from "console";
import { NotificationSocketRepository } from "../../repository/Sockets/paymentNotificationRepo";
let ioInstance: Server | null = null;
export const onlineUsers = new Map();
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
    ioInstance = io;


    // Handle sending messages  chat
    socket.on("post-new-message", async (newMessage, callback) => {
      console.log('////////////////////////////////')
      console.log("Received message:", newMessage);
      const { sender, receiver, message } = newMessage; // Ensure correct names
      const result = await WebSocketRepository.addNewMessage(newMessage)
      console.log(`Message from ${sender} to ${receiver}:`, message);
      const receiver1 = onlineUsers.get(receiver);
      console.log('reciever 1 ?', onlineUsers)
      if (receiver1) {
        const formattedTime = new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        console.log("Formatted Date for Message", formattedTime);
        console.log('userid ///', userId);
        console.log('reciever 1 ///', receiver1)

        io.to(receiver1.socketId).emit("receive-message", { senderId: sender, message, timeStamp: formattedTime })

      }
      callback({ success: true, message: "Message delivered successfully!" });
    });
        socket.on('post-payment-success',async(newMessage,callback)=>{
            console.log("Yeah");
            
        console.log("Received message of payment:",newMessage);
        const {senderId,receiverId,message}=newMessage;
       const heading='Payment SuccessFully'
        const result=await NotificationSocketRepository.addNewNotification(senderId,receiverId,message,heading)
        console.log(`Message from ${senderId} to ${receiverId}:`, message);
        const receiver=onlineUsers.get(receiverId);
        console.log("reciever 1?",onlineUsers);
        if(receiver){
            console.log('userid ///', senderId);
            console.log('reciever 1 ///', receiver)
        io.to(receiver.socketId).emit("receive-notification-message", { senderId, message  })
        }
        callback({success:true,message:"Message delivered successfully!"})
        })


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
export const getSocketInstance = (): Server | null => ioInstance;
export default initializeSocket;
