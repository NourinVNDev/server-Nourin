
import { IRetryEventRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IRetryEventPaymentRepo";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MANAGERWALLETDB from '../../models/managerModels/managerWalletSchema';
import ADMINWALLETDB from "../../models/adminModels/adminWalletSchema";
import USERWALLETDB from "../../models/userModels/userWalletSchema";
import mongoose from "mongoose";
import SendBookingCancellation from "../../utils/cancelConfirmation.util";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
interface EventData {
  email: string[];
  userName: string[];
  bookingId: string;
  eventName?: string;
  date?: string;
  seatNumbers: number;
  amount: number;
}

export class RetryEventPaymentRepo implements IRetryEventRepo{
async cancelBookedEventRepo(
  bookingId: string,
  userId: string
): Promise<{ success: boolean; message: string; data: any }> {
  try {



    const existingBooking = await BOOKEDUSERDB.findOne({ bookingId }).populate('eventId');
    if (!existingBooking) throw new Error("Booking not found");
    if (!existingBooking.totalAmount) throw new Error("Total amount is missing");

    const totalAmount = Number(existingBooking.totalAmount);
    const managerAmount = Math.ceil((totalAmount * 90) / 100);
    const adminAmount = Math.ceil((totalAmount * 10) / 100);

    const existingManager = await MANAGERWALLETDB.findOne({ "transactions.bookedId": bookingId });
    if (!existingManager || !existingManager.balance) throw new Error("Manager wallet or balance not found");

    const event = existingBooking.eventId as any;
    existingManager.balance -= managerAmount;
    existingManager.transactions.push({
      userId: new mongoose.Types.ObjectId(userId),
      managerAmount: -managerAmount,
      type: "debit",
      status: "completed",
      createdAt: new Date(),
      eventName: event.eventName || "Cancelled Event",
      bookedId: bookingId,
      companyName: event.companyName,
      noOfPerson: existingBooking.NoOfPerson
    });
    await existingManager.save();

    const existingAdmin = await ADMINWALLETDB.findOne({ "transactions.bookedId": bookingId });
    if (!existingAdmin || !existingAdmin.balance) throw new Error("Admin wallet or balance not found");

    existingAdmin.balance -= adminAmount;
    existingAdmin.transactions.push({
      totalAmount,
      userId: new mongoose.Types.ObjectId(userId),
      managerAmount: -managerAmount,
      adminAmount: -adminAmount,
      type: "debit",
      status: "completed",
      createdAt: new Date(),
      eventName: event.eventName || "Cancelled Event",
      bookedId: bookingId,
      noOfPerson: existingBooking.NoOfPerson,
      companyName: event.companyName
    });
    await existingAdmin.save();

    existingBooking.paymentStatus = "Cancelled";
    await existingBooking.save();

    const userWallet = await USERWALLETDB.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    const transactionEntry = {
      transaction: "Money Added",
      amount: totalAmount,
      bookingDate: existingBooking.bookingDate,
      bookingID: bookingId
    };

    if (!userWallet) {
      await USERWALLETDB.create({
        userId: new mongoose.Types.ObjectId(userId),
        balance: totalAmount,
        currency: "USD",
        transactionHistory: [transactionEntry]
      });
    } else {
      await USERWALLETDB.updateOne(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $inc: { balance: totalAmount },
          $push: { transactionHistory: transactionEntry }
        }
      );
    }

    const socialEvent = await SOCIALEVENTDB.findById(existingBooking.eventId);

    if (socialEvent) {
      const ticketToUpdate = socialEvent.typesOfTickets.find(
        (ticket: any) => ticket.type === existingBooking.ticketDetails?.type
      );

      if (
        ticketToUpdate &&
        typeof ticketToUpdate.noOfSeats === "number" &&
        existingBooking.NoOfPerson
      ) {
        ticketToUpdate.noOfSeats += existingBooking.NoOfPerson;
        await socialEvent.save();
      } else {
        console.warn("Ticket type not found or noOfSeats is not a number.");
      }
    }

    const eventData: EventData = {
      email: existingBooking.bookedUser.map((user: any) => user.email),
      userName: existingBooking.bookedUser.map((user: any) => user.user),
      bookingId,
      eventName: socialEvent?.eventName,
      date: socialEvent?.startDate ? new Date(socialEvent.startDate).toISOString() : undefined,
      seatNumbers: 1,
      amount:
        existingBooking.NoOfPerson && existingBooking.NoOfPerson > 0
          ? existingBooking.totalAmount / existingBooking.NoOfPerson
          : existingBooking.totalAmount
    };

    await SendBookingCancellation(
      eventData.email,
      eventData.userName,
      eventData.bookingId,
      eventData.eventName ?? "Cancelled Event",
      eventData.date ?? "",
      eventData.seatNumbers,
      eventData.amount
    );

    return {
      success: true,
      message: "Booking canceled successfully",
      data: eventData
    };
  } catch (error: any) {
    console.error("Error in cancelBookedEventRepo:", error.message);
    throw new Error("Failed to cancel booking: " + error.message);
  }
}

async fetchUserWalletRepo(userId:string){
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