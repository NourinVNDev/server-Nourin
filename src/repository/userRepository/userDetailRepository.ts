import { Types } from "mongoose";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import { billingData } from "../../config/enum/dto";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";

export class userDetailsRepository {
  async postHandleLike(index:string, userId:string,postId: string) {
    try {
      // Find the social event by ID
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENTDB.findOne({_id:postId});
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

      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENTDB.findOne({_id:postId}).populate('offer');
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${postId}`);
      }
      return singleEvent; 
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }
  async getSelectedEventRepository(postId: string) {
    try {
      // Find the social event by ID
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENTDB.findOne({_id:postId});
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
        console.log("Category", formData);
        
        // Check if the category exists
        const category = await CATEGORYDB.findOne({ categoryName: formData.categoryName });
        if (!category) {
            return { success: false, message: "Category not found", data: null };
        }

        // Check if the social event exists and if the ticket type has available seats
        const socialEvent = await SOCIALEVENTDB.findById(formData.eventId);
        if (!socialEvent) {
            return { success: false, message: "Social event not found", data: null };
        }
// console.log("SocialEvents:",socialEvent,formData.ticketType);

//         const ticket = socialEvent.typesOfTickets.find((ticket: any) => ticket.type.toLowerCase() === formData.ticketType);
//         console.log("Checking Tickets:",ticket);
        
        
        
//         if (!ticket || typeof ticket.noOfSeats !== 'number' || ticket.noOfSeats <= 0) {
//             return { success: false, message: "No available seats for the selected ticket type", data: null };
//         }

        // Generate a unique booking ID
        const bookingId = Math.floor(100000000000 + Math.random() * 900000000000);

        // Create a new booking document
        const newBooking = new BOOKEDUSERDB({
            bookingId: bookingId,
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
            data: { billingDetails: savedBooking.billingDetails, id: savedBooking._id, bookingId: savedBooking.bookingId }
        };

    } catch (error) {
        console.error("Error in saveUser BilingDetailsRepository:", error);
        throw new Error("Failed to save billing details.");
    }
}
async updateBookedPaymentStatusRepository(bookedId: string) {
  const bookedEvent = await BOOKEDUSERDB.findById(bookedId);


  if (!bookedEvent) {
    return {
      success: false,
      message: "Event not found",
    };
  }
  const socialEvent=await SOCIALEVENTDB.findById(bookedEvent.eventId);
  if (socialEvent) {
    const ticketToUpdate = socialEvent.typesOfTickets.find(
      (ticket: any) => ticket.type === bookedEvent.ticketDetails?.type
    );

    if (ticketToUpdate && typeof ticketToUpdate.noOfSeats === 'number' && bookedEvent.NoOfPerson) {
      ticketToUpdate.noOfSeats += bookedEvent.NoOfPerson;
      await socialEvent.save();
    } 
  bookedEvent.paymentStatus = "Cancelled"; 
  await bookedEvent.save();

  return {
    success: true,
    message: "Event details updated successfully",
  };
}

}
  
}
