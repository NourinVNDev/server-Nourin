import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WebSocketRepository } from "../repositories/socketRepository/commentSocketRepository";
import { NotificationSocketRepository } from "../repositories/socketRepository/paymentNotificationRepository";

let ioInstance: Server | null = null;
export const onlineUsers = new Map();
const users: { [key: string]: string[] } = {}; // For video rooms

const initializeSocket = (server: HttpServer) => {
const io = new Server(server, {
  cors: {
    origin: "https://client-nourin-9ey7.vercel.app", // ✅ your frontend domain
    methods: ["GET", "POST"],
    credentials: true, // ✅ allow cookies or headers if used
  },
});


  io.on("connection", (socket:any) => {
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
socket.on("post-new-message", async (newMessage: any, callback: any) => {
  try {
    const { sender, receiver, message, senderModel, receiverModel } = newMessage;
    console.log("Received message:", newMessage);

    const result = await WebSocketRepository.addNewMessage(newMessage);

    const receiverData = onlineUsers.get(receiver);

    if (receiverData) {
      console.log("Checking the time", result.createdAt);

      io.to(receiverData.socketId).emit("receive-message", {
        senderId: sender,
        message,
        timestamp: result.createdAt,
        totalMessage: result.totalMessage,
        chatId: result.chatId,
        receiverId:receiver,
        unreadCount:result.unreadCount
      });
      console.log("Unread12345",result.unreadMessage);
      
      io.to(receiverData.socketId).emit("new-notification1", {
        count: result.unreadMessage
      });
    }

    callback({
      success: true,
      message: "Message delivered successfully!",
      data: result
    });
  } catch (error) {
    console.error("Error in post-new-message:", error);
    callback({
      success: false,
      message: "Failed to deliver the message.",
      error: error
    });
  }
});



    socket.on("new-badge",async (senderId:any,callback:any)=>{
      
      console.log("SenderrrrrId:",senderId);
      
      const result=await WebSocketRepository.calculateUnReadMessage(senderId);
      console.log("Result of Badge:",result);


      

      
    })
//notification for new-event hosting
    socket.on('post-new-event',async(socketMessage:any,callback:any)=>{
      const {senderId,message}=socketMessage;
    const result = await NotificationSocketRepository.addNewEventNotification(senderId,message);
    })
//videoCall link notification
    socket.on('post-videoCallLink', async (socketMessage:any, callback:any) => {
      const { link, managerId, eventId } = socketMessage;
      console.log("Join",link);
      
    
      try {
        const notificationResult = await NotificationSocketRepository.shareVideoCallLink(link, managerId, eventId);
        console.log("Booked Users:", notificationResult);
      
        if (!notificationResult || !notificationResult.userIds || notificationResult.userIds.length === 0) {
          console.log("No users to notify");
          return;
        }
      
        // Convert ObjectIds to strings for comparison
        const userIdStrings = notificationResult.userIds.map(id => id.toString());
      
    
        userIdStrings.forEach((userId) => {
          const socketId = onlineUsers.get(userId);
          console.log(`User ${userId} socket:`, socketId || 'not connected');
          
          if (socketId) {
            io.to(socketId.socketId).emit('new-notification',{
              heading: 'Join Your Virtual Event',
              message: `Click <a href="${link}" target="_blank">here</a> to join live stream.`,
              count: notificationResult.unreadCount,
              link: link 
            });
          }
        })
        callback({ success: true, message: 'Shared notification sent to all booked users.' });
      } catch (err) {
        console.error("Socket error:", err);
        callback({ success: false, message: 'Error sending shared notification.' });
      }
    });

    socket.on('post-payment-success', async (newMessage:any, callback:any) => {
      const { senderId, receiverId, message,eventName} = newMessage;
      const heading = 'Payment Successfully';

      const result = await NotificationSocketRepository.addNewNotification(senderId, receiverId, message, heading,eventName);
      const receiverData = onlineUsers.get(receiverId);
      const senderData=onlineUsers.get(senderId);
      console.log("OnlineUser",onlineUsers);
      console.log("RecieverId:",receiverData);
      
      
      if (receiverData) {
        console.log("unreadCount:",result.unreadCount,result.userUnreadCount);
        io.to(receiverData.socketId).emit("new-notification", { senderId, message,count:result.unreadCount });
         io.to(senderData.socketId).emit("new-notification", { senderId, message,count:result.userUnreadCount });
      }

      callback({ success: true, message: "Notification sent successfully!" });
    });


    //makinng change in isRead field
    socket.on('change-isRead',async(newMessage:any,callback:any)=>{
      const {senderId,role}=newMessage;
      console.log("ManagerId black",senderId);
      const result=await NotificationSocketRepository.changeIsReadStatus(senderId,role);
      const senderData=onlineUsers.get(senderId);
      if(senderData){
        io.to(senderData.socketId).emit('new-notification1',{count:0})
      }
       callback({ success: true, message: "Notification sent successfully!" });
    })


    //adding new category
    socket.on('post-new-category',async(categoryName:any,callback:any)=>{
      const result = await NotificationSocketRepository.addCategoryNotification(categoryName);
      if (!result || !result.managerIds || result.managerIds.length === 0) {
        console.log("No manager to notify");
        return;
      }
      const managerIdStrings = result.managerIds.map(id => id.toString());
      managerIdStrings.forEach((managerId) => {
        console.log("OnlineUser:",onlineUsers);
        
        const socketId = onlineUsers.get(managerId);
        console.log(`Manager ${managerId} socket:`, socketId || 'not connected');
        if (socketId) {
          io.to(socketId.socketId).emit('new-categoryNotification',{
            count: result.unreadCount,
          });
        }
    })
  })

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

