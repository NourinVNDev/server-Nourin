
import initializeSocket from "./commentSocket";
import { getSocketInstance } from "./commentSocket";
const io=getSocketInstance();
import { NotificationSocketRepository } from "../../repository/Sockets/paymentNotificationRepo";
import { onlineUsers } from "./commentSocket";
io?.on("connection",(socket)=>{
console.log("helllo")
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
    io.to(receiver.socketId).emit("receive-message", { senderId, message  })
    }
    callback({success:true,message:"Message delivered successfully!"})
    })
})

