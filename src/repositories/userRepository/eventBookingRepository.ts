import { IEventBookingRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IEventBookingRepo";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import {Types} from "mongoose";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import { billingData, EventDetails, EventDocument, PaymentData, retryBillingData, retryPayment } from "../../dtos/user.dto";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";

export class EventBookingRepository implements IEventBookingRepo{



     async postHandleLikeRepo(index:string, userId:string,postId: string) {
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

      return {result:updatedEvent.likes}; // Return updated event for further use if needed
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
  } 
  async getPostDetailsRepo(postId:string){
      try {
    console.log('Post Id:', postId);
    const singleEvent = await SOCIALEVENTDB.findOne({ _id: postId })
      .populate('managerOffer')
      .populate('adminOffer');

    if (!singleEvent) {
      throw new Error(`Social Event not found for ID: ${postId}`);
    }

    return {singleEvent};
  } catch (error) {
    console.error("Error in getPostDetailsRepo:", error);
    throw new Error("Failed to fetch post details.");
  }
  }
  async getBookedEventRepo(bookingId:string){
    try {
      console.log('Booking Id:',bookingId);
      const singleEvent = await BOOKEDUSERDB.findOne({_id:bookingId,paymentStatus:'Pending'}).populate('eventId');
      if (!singleEvent) {
        throw new Error(`Social Event not found for ID: ${bookingId}`);
      }
      return {singleEvent};
    } catch (error) {
      console.error("Error in postHandleLike:", error);
      throw new Error("Failed to handle like functionality.");
    }
}
async checkSeatAvailable(product: PaymentData) {
  try {
    const socialEvent = await SOCIALEVENTDB.findOne({ eventName: product.eventName });
    if (!socialEvent) {
      return { success: false, message: "Event not found", data: null };
    }
    if(socialEvent?.title!='Virtual'){
  
  
      const selectedEvent = socialEvent.typesOfTickets.find(
        (ticket: any) => ticket.type.toLowerCase() === product.type
      );
  
      if (!selectedEvent) {
        return { success: false, message: "Ticket type not found", data: null };
      }
  
      if (!selectedEvent.noOfSeats || selectedEvent.noOfSeats <= 0 || selectedEvent.noOfSeats<product.noOfPerson) {
        return { success: false, message: "No seats available", data: null };
      }

    }
    return { success: true, message: "Seats available", data: { seatsRemaining:null} };

  } catch (error) {
    console.error("Error in checkSeatAvailable:", error);
    throw new Error("Failed to check seat availability.");
  }
}
async updateBookingData(product:PaymentData){
   const existingBooking = await BOOKEDUSERDB.findById(product.bookingId);
    console.log("Existing booking found:", existingBooking);

    if (!existingBooking) {
      return { success: false, message: "Booking not found"};
    }
        existingBooking.bookingDate = new Date();
    existingBooking.totalAmount = product.Amount||product.amount;
    existingBooking.NoOfPerson = product.noOfPerson;
    if (!existingBooking.ticketDetails) {
      existingBooking.ticketDetails = { Included: [], notIncluded: [], type: undefined };
    }
    
    existingBooking.ticketDetails.type = product.type || undefined;
    existingBooking.ticketDetails.Included = product.Included || [];
    existingBooking.ticketDetails.notIncluded = product.notIncluded || [];



console.log("Payment",product.bookedEmails,product.bookedMembers);
console.log("Length:",product.bookedEmails.length,product.bookedMembers.length);
    if (
      Array.isArray(product.bookedMembers) &&
      Array.isArray(product.bookedEmails) &&
      product.bookedMembers.length === product.bookedEmails.length
    ) {
      console.log("Black");
      for (let i = 0; i < product.bookedMembers.length; i++) {
        console.log(product.bookedMembers[i],product.bookedEmails[i]);
        existingBooking.bookedUser.push({
         
          user: product.bookedMembers[i],
          email: product.bookedEmails[i],
          isParticipated: false,
        });
      }
    }
    


    

    const uniqueIncluded = new Set(product.Included || []);
    const uniqueNotIncluded = new Set(product.notIncluded || []);
    
    existingBooking.ticketDetails.Included = Array.from(uniqueIncluded);
    existingBooking.ticketDetails.notIncluded = Array.from(uniqueNotIncluded);
    
    const updatedBooking = await existingBooking.save();
    return {success:true,message:'Saved Booked User Data'};
}
async checkRetrySeatAvailable(product: retryPayment) {
  try {
    const socialEvent = await SOCIALEVENTDB.findOne({ eventName: product.eventName });
    if (!socialEvent) {
      return { success: false, message: "Event not found", data: null };
    }
    if(socialEvent?.title!='Virtual'){
  
  
      const selectedEvent = socialEvent.typesOfTickets.find(
        (ticket: any) => ticket.type.toLowerCase() === product.type
      );
  
      if (!selectedEvent) {
        return { success: false, message: "Ticket type not found", data: null };
      }
  
      if (!selectedEvent.noOfSeats || selectedEvent.noOfSeats <= 0 || selectedEvent.noOfSeats<product.noOfPerson) {
        return { success: false, message: "No seats available", data: null };
      }

    }
    return { success: true, message: "Seats available", data: { seatsRemaining:null} };

  } catch (error) {
    console.error("Error in checkSeatAvailable:", error);
    throw new Error("Failed to check seat availability.");
  }
}
  async getCategoryBasedRepo(postId: string) {
    try {
      console.log("Id of category:", postId);

      // Fetch category and populate Events as full objects
      const category = await CATEGORYDB.findById(postId).populate<{ Events: EventDocument[] }>("Events");

      if (!category) {
        return {
          success: false,
          message: "Category not found.",
          category: null,
        };
      }

      console.log("Category details:", category);

      // Filter events that have a valid endDate
      const now = Date.now();
      let filteredEvents = category.Events.filter(event => new Date(event.startDate).getTime() >= now);
      

      console.log("First", filteredEvents);
      filteredEvents = filteredEvents.map(event => {
        if (event.offer && new Date(event.offer.endDate) < new Date()) {
            console.log(`Offer expired for event: ${event.endDate}`);
            event.offer = null; 
        }
        return event;
    });

      console.log("Main Events", filteredEvents);

      return {
        success: true,
        message: "Category details retrieved successfully.",
        category: {
          ...category.toObject(),
          Events: filteredEvents, 
        },
      };
    } catch (error) {
      console.error("Error retrieving category details:", error);
      return {
        success: false,
        message: "An error occurred while retrieving category details.",
        category: null,
      };
    }
  }
async saveBillingDetailsRepo(formData:billingData){
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
            NoOfPerson:0,
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
async saveRetryBillingRepo(formData:retryBillingData){
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

async updatePaymentStatusRepo(bookedId:string){
  try {

  console.log("Checking BookedID",bookedId);
  
  const bookedEvent = await BOOKEDUSERDB.findById(bookedId);

  if (!bookedEvent) {
    return {
      success: false,
      message: "Booking not found",
    };
  }
  // await bookedEvent.deleteOne();
  return {
    success: true,
    message: "Booking deleted successfully",
  };
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}

async checkUserBookingValidRepo(email:string,eventName:string,bookedId:string){
    try {
const booking = await BOOKEDUSERDB.findOne({ bookingId: bookedId }).populate("eventId");

  if (!booking) {
    return {
      success: false,
      message: "User has not booked this event",
    };
  }

  const event = booking.eventId as unknown as EventDetails;
  const user = booking.bookedUser.find((u: any) => u.email === email);
  const now = new Date();

  if (!event || !user) {
    return {
      success: false,
      message: "User has not booked this event",
    };
  }

  const { startDate, endDate, time, eventName: eName } = event;

  // Check event name match
  if (eName !== eventName) {
    return {
      success: false,
      message: "User has not booked this event",
    };
  }

  // Convert to Date objects with range
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Check if today's date is within event range
  const isTodayInRange = now >= start && now <= end;

  // Calculate earliest entry time (10 mins before start time)
  const [hours, minutes] = time.split(":").map(Number);
  const eventStartDateTime = new Date(startDate);
  eventStartDateTime.setHours(hours, minutes, 0, 0);
  const earliestEntryTime = new Date(eventStartDateTime.getTime() - 10 * 60000);

  // Handle Cancelled status
  if (booking.paymentStatus === "Cancelled") {
    return {
      success: false,
      message: "Your booking was cancelled. You cannot enter the event",
    };
  }

  // Handle out-of-date range
  if (!isTodayInRange) {
    return {
      success: false,
      message: "Today's date is not within the event's valid date range",
    };
  }

  // Handle early entry
  if (now < earliestEntryTime) {
    return {
      success: false,
      message: "You can only enter starting from 10 minutes before the event starts",
    };
  }

  // All checks passed
  return {
    success: true,
    message: "User has booked this event and is allowed to enter",
  };
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


}