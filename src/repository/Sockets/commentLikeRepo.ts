import socialEventSchema from "../../models/managerModels/socialEventSchema";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
import USERDB from "../../models/userModels/userSchema";
import NOTIFICATIONDB from "../../models/userModels/notificationSchema";
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
    console.log("New Message", newMessage);

    const { sender, receiver, message, senderModel, receiverModel } = newMessage as any;
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
      message,
      isRead: false
    });

    conversation.messages.push(savedMessage._id);
    conversation.lastMessage = savedMessage._id;
    await conversation.save();

    const totalMessage = await MESSAGEDB.countDocuments({
      $or: [
        { senderId: sender, receiverId: receiver },
        { senderId: receiver, receiverId: sender }
      ]
    });

    const isSenderUser = senderModel === 'User';
    console.log("IsSenderUser", isSenderUser);

    const newNotification = new NOTIFICATIONDB({
      heading: "New Message",
      message: "You have received a new message.",
      from: sender,
      isRead: false,
      fromModal: isSenderUser ? 'bookedUser' : 'Manager',
      to: receiver,
      toModal: isSenderUser ? 'Manager' : 'bookedUser',
    });

    await newNotification.save();

    const unreadMessage = await NOTIFICATIONDB.countDocuments({
      toModal: isSenderUser ? 'Manager' : 'bookedUser',
      to: receiver,
      isRead: false
    });

    return {
      messageId: savedMessage._id,
      content: savedMessage.message,
      createdAt: savedMessage.createdAt,
      totalMessage,
      chatId: conversation._id,
      unreadMessage
    };

  } catch (error) {
    console.error("Error adding new message:", error);
    throw error;
  }
}



  static async calculateUnReadMessage(senderId: string) {
    const conversations = await CONVERSATIONDB.find({ participants: { $in: [senderId] } }).populate('messages');
    let unreadCount = 0;
  
    conversations.forEach((conversation: any) => {
      conversation.messages.forEach((message: any) => {
        if (message.senderId !== senderId && !message.isRead) {
          unreadCount++;
        }
      });
    });
  
    return unreadCount;
  }
}