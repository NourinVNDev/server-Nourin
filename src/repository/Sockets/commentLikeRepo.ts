import socialEventSchema from "../../models/managerModels/socialEventSchema";
import USERDB from "../../models/userModels/userSchema";

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
}
