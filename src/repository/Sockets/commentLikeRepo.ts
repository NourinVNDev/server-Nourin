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

      // Push the new comment into the comments array
      socialEvent.comments.push({
        user: userId,
        content: comment,
        createdAt: new Date(),
      });

      // Save the updated post
      await socialEvent.save();

      // Find the user based on the userId
      const userName = await USERDB.findById(userId);
      if (!userName) {
        throw new Error("User not found");
      }

      // Return the comment content and the user name
      return {
        comment: socialEvent.comments[socialEvent.comments.length - 1].content || "", // Only the comment content
        userName: userName.firstName || "Unknown User", // Fallback in case firstName is missing
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
  
      // Find the conversation between the two participants
      const conversation = await CONVERSATIONDB.findOne({
        participants: { $all: [sender, receiver] } // Ensure both users are in the conversation
      });
  
      if (!conversation) {
        throw new Error("Conversation not found");
      }
  
      // Create a new message
      const savedMessage = await MESSAGEDB.create({
        chatId: conversation._id,
        senderId: sender, // Assuming the sender is the userId
        receiverId: receiver, // Assuming the receiver is the managerId
        message: message
      });
  
      // Push the message ID into the conversation's messages array
      conversation.messages.push(savedMessage._id);
      await conversation.save(); // Save the updated conversation
  
      // Return the saved message or relevant information
      return {
        messageId: savedMessage._id,
        content: savedMessage.message, // Use savedMessage.message instead of savedMessage.content
        createdAt: savedMessage.createdAt,
      };
    } catch (error) {
      console.error("Error adding new message:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }
}