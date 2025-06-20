import { retryPayment } from "../../dtos/user.dto";
import { IStripeRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IStripeRepo";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import MANAGERWALLETDB from "../../models/managerModels/managerWalletSchema";
import ADMINDB from "../../models/adminModels/adminSchema";
import ADMINWALLETDB from "../../models/adminModels/adminWalletSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
export class StripePaymentRepository implements IStripeRepo{


    async saveRetryPaymentData(paymentData: retryPayment) {
  try {
    console.log("Checking the bookedId", paymentData);


    if (!paymentData.bookedId || !paymentData.paymentStatus  || !paymentData.companyName) {
      throw new Error("Missing required payment data.");
    }
    const existingBooking = await BOOKEDUSERDB.findById(paymentData.bookingId);
    console.log("Existing booking found:", existingBooking);

    if (!existingBooking) {
      return { success: false, message: "Booking not found", data: null };
    }


    console.log("NoOfPerson",paymentData.noOfPerson);
    
    existingBooking.paymentStatus = "Completed";
    existingBooking.bookingDate = new Date();
    existingBooking.totalAmount = paymentData.amount;
    existingBooking.NoOfPerson = paymentData.noOfPerson;
    if (!existingBooking.ticketDetails) {
      existingBooking.ticketDetails = { Included: [], notIncluded: [], type: undefined };
    }
    
    existingBooking.ticketDetails.type = paymentData.type || undefined;




console.log("Payment",paymentData.bookedEmails,paymentData.bookedMembers);
console.log("Length:",paymentData.bookedEmails.length,paymentData.bookedMembers.length);
  
if (
  Array.isArray(paymentData.bookedMembers) &&
  Array.isArray(paymentData.bookedEmails)
) {

  existingBooking.bookedUser.splice(0, existingBooking.bookedUser.length);


  for (let i = 0; i < paymentData.bookedMembers.length; i++) {
    existingBooking.bookedUser.push({
      user: paymentData.bookedMembers[i],
      email: paymentData.bookedEmails[i],
      isParticipated: false,
    });
  }
}


    


    
    const updatedBooking = await existingBooking.save();

    const managerDetails = await MANAGERDB.findOne({ firmName: paymentData.companyName });
    console.log("Manager details found:", managerDetails);

    if (!managerDetails) {
      return { success: false, message: "Manager not found", data: null };
    }

    let adminAmount=0;
    let managerAmount=0;
    if (existingBooking.paymentStatus ==='Completed') {
      const totalAmount = paymentData.amount;
      managerAmount = Math.floor(totalAmount * 0.9);
      adminAmount = Math.floor(totalAmount * 0.1);
      console.log("Processing Stripe Transfer...");

      let managerWallet = await MANAGERWALLETDB.findOne({ managerId: managerDetails._id });
      if (!managerWallet) {
        managerWallet = new MANAGERWALLETDB({ managerId: managerDetails._id, balance: 0, currency: 'USD', transactions: [] });
      }
      
      managerWallet.balance += Math.round(managerAmount);
      managerWallet.transactions.push({
        userId: existingBooking.userId,
        managerAmount,
        type: "credit",
        status: "completed",
        eventName:paymentData.eventName,
        bookedId:paymentData.bookedId,
        noOfPerson:paymentData.noOfPerson
      });
      await managerWallet.save();
    }
    let adminDetails = await ADMINDB.findOne(); // Fetch the single admin
    if (!adminDetails) {
        throw new Error("Admin not found");
    }
    
    let adminWallet = await ADMINWALLETDB.findOne({ adminId: adminDetails._id });
    if(!adminWallet){
     adminWallet = await ADMINWALLETDB.create({
        adminId: adminDetails._id,
        balance: adminAmount, // Assign balance directly
        currency: 'USD',
        transactions: [
          {
            totalAmount: paymentData.amount,
            userId: paymentData.userId,
            managerAmount: managerAmount,
            adminAmount:adminAmount,
            type: 'credit',
            status: 'completed',
            createdAt: new Date(),
            eventName:paymentData.eventName,
            bookedId:paymentData.bookedId,
            noOfperson:paymentData.noOfPerson,
            companyName:paymentData.companyName
      
          }
        ]
      });
      
    }else{
      adminWallet.balance += adminAmount;
  adminWallet.transactions.push({
    totalAmount: paymentData.amount,
    userId: paymentData.userId,
    managerAmount: managerAmount,
    adminAmount:adminAmount,
    type: 'credit',
    status: 'completed',
    createdAt: new Date(),
    eventName:paymentData.eventName,
    bookedId:paymentData.bookedId
  });
  await adminWallet.save();
    }
    
  

    const socialEvent = await SOCIALEVENTDB.findOne({ eventName: paymentData.eventName });

    if (socialEvent) {
      console.log("No of Person:",paymentData.noOfPerson);
      socialEvent.typesOfTickets.forEach((ticket: any) => {
        if (ticket.type.toLowerCase() === paymentData.type) {
          console.log("Hellom");
          
          ticket.noOfSeats -= paymentData.noOfPerson;
        }
      });
     
    
      await socialEvent.save();
    }
    return {
      success: true,
      message: "Payment data saved successfully",
      data: updatedBooking,
    };

  } catch (error) {
    console.error("Error saving payment data:", error || error);
    return { success: false, message: "Database error while saving payment data.", data: null };
  }
}


async handleCancelPayment(bookingId: string): Promise<void> {
  console.log("What is this",bookingId);
  
  if (!bookingId) {
    console.warn(" No bookingId provided to cancel payment.");
    return;
  }

  try {
    const result = await BOOKEDUSERDB.deleteOne({ _id: bookingId });

    if (result.deletedCount === 0) {
      console.warn(` No booking found with ID: ${bookingId}`);
    } else {
      console.log(` Booking with ID ${bookingId} successfully cancelled.`);
    }
  } catch (error) {
    console.error(`Error cancelling booking with ID ${bookingId}:`, error);
  }
}
    
}