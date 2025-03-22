import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MANAGERWALLETDB from "../../models/managerModels/managerWalletSchema";
import ADMINWALLETDB from "../../models/adminModels/adminWalletSchema";
import USERWALLETDB from "../../models/userModels/userWalletSchema";
import mongoose from "mongoose";
import userWalletSchema from "../../models/userModels/userWalletSchema";
export class CancelEventRepository {
  async cancelBookedEventRepository(bookingId: string,userId:string) {
    try {
      // Find existing booking
      const existingBooking = await BOOKEDUSERDB.findOne({ bookingId });

      if (!existingBooking) {
        throw new Error("Booking not found");
      }

      if (!existingBooking.totalAmount) {
        throw new Error("Total Amount is not found");
      }

      console.log("Existing Booking:", existingBooking);

      const totalAmount = Number(existingBooking.totalAmount);
      const managerAmount = Math.ceil((totalAmount * 90) / 100);
      const adminAmount = Math.ceil((totalAmount * 10) / 100);

      // Find Manager Wallet
      const existingManager = await MANAGERWALLETDB.findOne({
        "transactions.bookedId": bookingId,
      });

      if (!existingManager) {
        throw new Error("Manager wallet not found");
      }

      if (!existingManager.balance) {
        throw new Error("There is no balance");
      }

      // Deduct amount from Manager's balance
      existingManager.balance -= managerAmount;
      await existingManager.save();

      // Find Admin Wallet
      const existingAdmin = await ADMINWALLETDB.findOne({
        "transactions.bookedId": bookingId,
      });

      if (!existingAdmin) {
        throw new Error("Admin wallet not found");
      }

      if (!existingAdmin.balance) {
        throw new Error("Admin wallet is Empty");
      }

      // Deduct amount from Admin's balance
      existingAdmin.balance -= adminAmount;
      await existingAdmin.save();

      // Remove Transaction from Manager's Wallet
      const managerUpdate = await MANAGERWALLETDB.updateOne(
        { _id: existingManager._id }, // Ensure correct filter
        { $pull: { transactions: { bookedId: bookingId } } }
      );

      console.log("Manager transaction removal:", managerUpdate);

      // Remove Transaction from Admin's Wallet
      const adminUpdate = await ADMINWALLETDB.updateOne(
        { _id: existingAdmin._id }, // Ensure correct filter
        { $pull: { transactions: { bookedId: bookingId } } }
      );

      console.log("Admin transaction removal:", adminUpdate);

      // Update Booking Status
      existingBooking.paymentStatus = "Cancelled";
      await existingBooking.save();


      const userWallet = await USERWALLETDB.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!userWallet) {
        // Create a new wallet if it doesn't exist
        await USERWALLETDB.create({
          userId: new mongoose.Types.ObjectId(userId),
          balance: totalAmount,
          currency: 'USD',
          transactionHistory: [
            {
              transaction: 'Money Added',
              amount: totalAmount,
            },
          ],
        });
      } else {
        // Update existing wallet: Add balance and push transaction
        await USERWALLETDB.updateOne(
          { userId: new mongoose.Types.ObjectId(userId) },
          {
            $inc: { balance: totalAmount }, // Increment balance
            $push: {
              transactionHistory: {
                transaction: 'Money Added',
                amount: totalAmount,
              },
            },
          }
        );
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
      message: "Booking canceled successfully",
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
