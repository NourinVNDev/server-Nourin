import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MANAGERWALLETDB from "../../models/managerModels/managerWalletSchema";
import ADMINWALLETDB from "../../models/adminModels/adminWalletSchema";
import USERWALLETDB from "../../models/userModels/userWalletSchema";
import mongoose from "mongoose";
import userWalletSchema from "../../models/userModels/userWalletSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
export class CancelEventRepository {
  async cancelBookedEventRepository(bookingId: string, userId: string) {
    try {
      const existingBooking = await BOOKEDUSERDB.findOne({ bookingId }).populate('eventId');
      if (!existingBooking) throw new Error("Booking not found");
      if (!existingBooking.totalAmount) throw new Error("Total Amount is not found");
  
      const totalAmount = Number(existingBooking.totalAmount);
      const managerAmount = Math.ceil((totalAmount * 90) / 100);
      const adminAmount = Math.ceil((totalAmount * 10) / 100);
  
      const existingManager = await MANAGERWALLETDB.findOne({
        "transactions.bookedId": bookingId,
      });
  
      if (!existingManager) throw new Error("Manager wallet not found");
      if (!existingManager.balance) throw new Error("There is no balance");
      const event = existingBooking.eventId as any;
      existingManager.balance -= managerAmount;
      existingManager.transactions.push({
        userId: new mongoose.Types.ObjectId(userId),
        managerAmount: -managerAmount,
        type: "debit",
        status: "completed",
        createdAt: new Date(),
        eventName:event.eventName || "Cancelled Event",
        bookedId: bookingId,
        companyName:event.companyName,
        noOfPerson:existingBooking.NoOfPerson
      });
      await existingManager.save();
  
      const existingAdmin = await ADMINWALLETDB.findOne({
        "transactions.bookedId": bookingId,
      });
  
      if (!existingAdmin) throw new Error("Admin wallet not found");
      if (!existingAdmin.balance) throw new Error("Admin wallet is Empty");
  
      existingAdmin.balance -= adminAmount;
      existingAdmin.transactions.push({
        totalAmount:existingBooking.totalAmount,
        userId: new mongoose.Types.ObjectId(userId),
        managerAmount: -managerAmount,
        adminAmount:-adminAmount,
        type: "debit",
        status: "completed",
        createdAt: new Date(),
        eventName: event.eventName || "Cancelled Event",
        bookedId: bookingId,
        noOfPerson:existingBooking.NoOfPerson,
        companyName:event.companyName
      });
      await existingAdmin.save();
  
      existingBooking.paymentStatus = "Cancelled";
      await existingBooking.save();
  
      const userWallet = await USERWALLETDB.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  
      if (!userWallet) {
        await USERWALLETDB.create({
          userId: new mongoose.Types.ObjectId(userId),
          balance: totalAmount,
          currency: "USD",
          transactionHistory: [
            {
              transaction: "Money Added",
              amount: totalAmount,
            },
          ],
        });
      } else {
        await USERWALLETDB.updateOne(
          { userId: new mongoose.Types.ObjectId(userId) },
          {
            $inc: { balance: totalAmount },
            $push: {
              transactionHistory: {
                transaction: "Money Added",
                amount: totalAmount,
              },
            },
          }
        );
      }


      const socialEvent = await SOCIALEVENTDB.findById(existingBooking.eventId);

      if (socialEvent) {
        const ticketToUpdate = socialEvent.typesOfTickets.find(
          (ticket: any) => ticket.type === existingBooking.ticketDetails?.type
        );
      
        if (ticketToUpdate && typeof ticketToUpdate.noOfSeats === 'number' && existingBooking.NoOfPerson) {
          ticketToUpdate.noOfSeats += existingBooking.NoOfPerson;
          await socialEvent.save();
        } else {
          console.warn("Ticket type not found or noOfSeats is not a number.");
        }
      }
            
      return {
        success: true,
        message: "Booking canceled successfully",
        data: existingBooking,
      };
    } catch (error) {
      console.error("Error canceling event:", error);
      return {
        success: false,
        message: "Error occurred during canceling event",
        data: null,
      };
    }
  }
  

  async fetchUserWalletRepository(userId:string){
    try{
    const userWallet=await USERWALLETDB.findOne({userId:userId});
    console.log(userWallet)
    return {
      success: true,
      message: "Retrive User Wallet successfully",
      data: userWallet,
    };
  } catch (error) {
    console.error("Error canceling event:", error);
    return {
      success: false,
      message: "Error occurred during canceling event",
      data: null,
    };
  }

  }
}
