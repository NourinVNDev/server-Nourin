import { Types } from "mongoose";
import SOCIALEVENT from "../../models/managerModels/socialEventSchema";
import { billingData } from "../../config/enum/dto";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
export class userDetailsRepository {
  async postHandleLike(index:string, userId:string,postId: string) {
    try {
      // Find the social event by ID
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENT.findOne({_id:postId});
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${postId}`);
      }

      // Check if the user has already liked the post
      const existingLikeIndex = singleEvent.likes.findIndex(
        (like) => like.user && like.user.toString() === userId
      );

      if (existingLikeIndex !== -1) {
        // User has already liked the post; remove the like
        singleEvent.likes.splice(existingLikeIndex, 1);
      } else {
        // Add the like
        singleEvent.likes.push({ user: new Types.ObjectId(userId) });
      }

      // Save the updated event
      const updatedEvent = await singleEvent.save();
      console.log("Updated Event Likes:", updatedEvent.likes);

      return updatedEvent.likes; // Return updated event for further use if needed
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }



  async getPostDetailsRepository(postId: string) {
    try {
      // Find the social event by ID
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENT.findOne({_id:postId});
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${postId}`);
      }
      return singleEvent; // Return updated event for further use if needed
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }
  async getSelectedEventRepository(postId: string) {
    try {
      // Find the social event by ID
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENT.findOne({_id:postId});
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${postId}`);
      }
      return singleEvent; // Return updated event for further use if needed
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }


  async saveUserBilingDetailsRepository(formData: billingData) {
    try {
        // Find the category by name
        console.log("Category", formData);
        const category = await CATEGORYDB.findOne({ categoryName: formData.categoryName });

        if (!category) {
            return { success: false, message: "Category not found", data: null };
        }


        const existingBooking=await BOOKEDUSERDB.findById(formData.bookedId)
        console.log("Raaper",existingBooking);
        // Create a new booking document
        const newBooking = new BOOKEDUSERDB({
            eventId: formData.eventId,
            userId: formData.userId,
            categoryId: category._id,
            billingDetails: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNo: formData.phoneNo,
                address: formData.address
            }
        });

        // Save the booking
        const savedBooking = await newBooking.save();

        if (!savedBooking) {
            return { success: false, message: "Event Details not saved", data: null };
        }

        // Return success message and data
        return { 
            success: true, 
            message: "Event Details saved", 
            data: { billingDetails: savedBooking.billingDetails, id: savedBooking._id }
        };

    } catch (error) {
        console.error("Error in saveUserBilingDetailsRepository:", error);
        throw new Error("Failed to save billing details.");
    }
}



  





  
}
