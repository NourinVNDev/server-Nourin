import socialEventSchema from "../../models/managerModels/socialEventSchema";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
import USERDB from "../../models/userModels/userSchema";
type NewMessage = {
  userId: string;
  managerId: string;
  message: string;
};
export class WebSocketRepository {
  static async addComment(userId: string, postId: string, comment: string) {
    try {
      const socialEvent = await socialEventSchema.findById(postId);
      if (!socialEvent) {
        throw new Error("Post not found");
      }

 
      socialEvent.comments.push({
        user: userId,
        content: comment,
        createdAt: new Date(),
      });

      await socialEvent.save();


      const userName = await USERDB.findById(userId);
      if (!userName) {
        throw new Error("User not found");
      }


      return {
        comment: socialEvent.comments[socialEvent.comments.length - 1].content || "", 
        userName: userName.firstName || "Unknown User",
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }



  static async addNewMessage(newMessage: NewMessage) {
    try {
      console.log("New Message",newMessage);
      
      const { sender, receiver, message } = newMessage as any;
      console.log("from Repo", sender, receiver, message);

      const conversation = await CONVERSATIONDB.findOne({
        participants: { $all: [sender, receiver] }
      });
  
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const savedMessage = await MESSAGEDB.create({
        chatId: conversation._id,
        senderId: sender, 
        receiverId: receiver, 
        message: message
      });
  
  
      conversation.messages.push(savedMessage._id);
      await conversation.save();
  
   
      return {
        messageId: savedMessage._id,
        content: savedMessage.message, 
        createdAt: savedMessage.createdAt,
      };
    } catch (error) {
      console.error("Error adding new message:", error);
      throw error; 
    }
  }
}