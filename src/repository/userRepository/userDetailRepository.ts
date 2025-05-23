import { Types } from "mongoose";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import { billingData, retryBillingData } from "../../config/enum/dto";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
interface EventDetails {
  eventName: string;
  startDate: string;
  endDate: string;
  time: string;
}
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
      console.log('Post Id:',postId);
      const singleEvent = await SOCIALEVENTDB.findOne({_id:postId});
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${postId}`);
      }
      return singleEvent;
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }
  async  getCancelBookingRepository(bookingId:string){
    try {
      console.log('Booking Id:',bookingId);
      const singleEvent = await BOOKEDUSERDB.findOne({_id:bookingId,paymentStatus:'Cancelled'}).populate('eventId');
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${bookingId}`);
      }
      return singleEvent;
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  }

// async checkUserBookingValidRepository(email: string, eventName: string) {

//   const bookings = await BOOKEDUSERDB.find().populate('eventId');

//   const isBooked = bookings.some((booking: any) => {
//     return (
//       booking.eventId?.eventName === eventName &&
//       booking.bookedUser.some((user: any) => user.email === email)
//     );
//   });

//   if (isBooked) {
//     return {
//       success: true,
//       message: "User has already booked this event",
//     };
//   } else {
//     return {
//       success: false,
//       message: "User has not booked this event",
//     };
//   }
// }
async checkUserBookingValidRepository(email: string, eventName: string) {
  const bookings = await BOOKEDUSERDB.find().populate('eventId');

  const now = new Date();

  const isBooked = bookings.some((booking: any) => {
  const event = booking.eventId as unknown as EventDetails;


    if (!event) return false;

    const { startDate, endDate, time } = event;

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const isTodayInRange = now >= start && now <= end;

    // Construct full datetime for event start
    const [hours, minutes] = time.split(':').map(Number);
    const eventStartDateTime = new Date(startDate);
    eventStartDateTime.setHours(hours, minutes, 0, 0);

    // Calculate earliest allowed entry time (10 minutes before event starts)
    const earliestEntryTime = new Date(eventStartDateTime.getTime() - 10 * 60000);
    const isEntryTimeReached = now >= earliestEntryTime;

    return (
      event.eventName === eventName &&
      isTodayInRange &&
      isEntryTimeReached &&
      booking.bookedUser.some((user: any) => user.email === email)
    );
  });

  if (isBooked) {
    return {
      success: true,
      message: "User has booked this event and is allowed to enter",
    };
  } else {
    // Extra message clarity
    const event = bookings.find(
      (booking: any) => booking.eventId?.eventName === eventName
    )?.eventId as unknown as EventDetails;

    if (event) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const [hours, minutes] = event.time.split(':').map(Number);
      const eventStartDateTime = new Date(event.startDate);
      eventStartDateTime.setHours(hours, minutes, 0, 0);

      const earliestEntryTime = new Date(eventStartDateTime.getTime() - 10 * 60000);

      if (now < start || now > end) {
        return {
          success: false,
          message: "Today's date is not within the event's valid date range",
        };
      } else if (now < earliestEntryTime) {
        return {
          success: false,
          message: "You can only enter starting from 10 minutes before the event starts",
        };
      }
    }

    return {
      success: false,
      message: "User has not booked this event",
    };
  }
}





  async saveUserBilingDetailsRepository(formData: billingData) {
    try {
        console.log("Category", formData);
        const category = await CATEGORYDB.findOne({ categoryName: formData.categoryName });
        if (!category) {
            return { success: false, message: "Category not found", data: null };
        }
        const socialEvent = await SOCIALEVENTDB.findById(formData.eventId);
        if (!socialEvent) {
            return { success: false, message: "Social event not found", data: null };
        }

        const bookingId = Math.floor(100000000000 + Math.random() * 900000000000);

        const newBooking = new BOOKEDUSERDB({
            bookingId: bookingId,
            eventId: formData.eventId,
            userId: formData.userId,
            categoryId: category._id,
            paymentStatus:'Pending',
            billingDetails: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNo: formData.phoneNo,
                address: formData.address
            }

        });

        const savedBooking = await newBooking.save();
        if (!savedBooking) {
            return { success: false, message: "Event Details not saved", data: null };
        }

        // Return success message and data
        return { 
            success: true, 
            message: "Event Details saved", 
            data: { billingDetails: savedBooking.billingDetails, id: savedBooking._id, bookingId: savedBooking.bookingId,paymentStatus:savedBooking.paymentStatus }
        };

    } catch (error) {
        console.error("Error in saveUser BilingDetailsRepository:", error);
        throw new Error("Failed to save billing details.");
    }
}

async saveRetryBilingRepository(formData: retryBillingData) {
  try {
    console.log("Updating booking data", formData);
    
 
    const updatedBooking = await BOOKEDUSERDB.findByIdAndUpdate(
      formData.bookingId, 
      {
        $set: {
  
          'billingDetails.firstName': formData.firstName,
          'billingDetails.lastName': formData.lastName,
          'billingDetails.email': formData.email,
          'billingDetails.phoneNo': formData.phoneNo,
          'billingDetails.address': formData.address,
       
          updatedAt: new Date() 
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
      return { 
        success: false, 
        message: "Booking not found or update failed", 
        data: null 
      };
    }
    return { 
      success: true, 
      message: "Booking details updated successfully", 
      data: { 
        billingDetails: updatedBooking.billingDetails, 
        id: updatedBooking._id, 
        bookingId: updatedBooking.bookingId ,
        paymentStatus:updatedBooking.paymentStatus

      }
    };

  } catch (error) {
    console.error("Error in saveRetryBilingRepository:", error);
    throw new Error("Failed to update booking details.");
  }
}
// async updateBookedPaymentStatusRepository(bookedId: string) {
//   const bookedEvent = await BOOKEDUSERDB.findById(bookedId);



// //   if (!bookedEvent) {
// //     return {
// //       success: false,
// //       message: "Event not found",
// //     };
// //   }
// //   const socialEvent=await SOCIALEVENTDB.findById(bookedEvent.eventId);
// //   if (socialEvent) {
// //     const ticketToUpdate = socialEvent.typesOfTickets.find(
// //       (ticket: any) => ticket.type === bookedEvent.ticketDetails?.type
// //     );

// //     if (ticketToUpdate && typeof ticketToUpdate.noOfSeats === 'number' && bookedEvent.NoOfPerson) {
// //       ticketToUpdate.noOfSeats += bookedEvent.NoOfPerson;
// //       await socialEvent.save();
// //     } 
// //   bookedEvent.paymentStatus = "Cancelled"; 
// //   await bookedEvent.save();

// //   return {
// //     success: true,
// //     message: "Event details updated successfully",
// //   };
// // }

// }
async updateBookedPaymentStatusRepository(bookedId: string) {

  console.log("Checking BookedID",bookedId);
  
  const bookedEvent = await BOOKEDUSERDB.findById(bookedId);

  if (!bookedEvent) {
    return {
      success: false,
      message: "Booking not found",
    };
  }

  await bookedEvent.deleteOne();

  return {
    success: true,
    message: "Booking deleted successfully",
  };
}

  
}
