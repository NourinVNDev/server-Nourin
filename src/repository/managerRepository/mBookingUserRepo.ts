import { send } from "node:process";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import USERDB from "../../models/userModels/userSchema";
import mongoose from "mongoose";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
export class managerBookingRepository{
    async getTodaysBookingRepository() {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
    
            console.log("Hello", await BOOKEDUSERDB.find());
    
            // Find bookings within today's date range
            const result = await BOOKEDUSERDB.find({
                bookingDate: { $gte: startOfDay, $lte: endOfDay }
            });
    
            console.log("Today's Bookings:", result);
            return { success: true, message: "Today's bookings retrieved successfully", data: result };
        } catch (error) {
            console.error("Error in getTodaysBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getTotalBookingRepository() {
        try {
            const currentDate = new Date();
            console.log("Current Date:", currentDate);
    
            // Set the start of today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    
            // Find today's bookings
            const todaysBookings = await BOOKEDUSERDB.find({
                bookingDate: { $gte: startOfDay, $lte: currentDate } // Today's bookings
            });
    
            // Find future bookings
            const futureBookings = await BOOKEDUSERDB.find({
                bookingDate: { $gt: currentDate } // Future bookings
            });
    
            // Combine today's and future bookings
            const allBookings = [...todaysBookings, ...futureBookings];
    
            console.log("Today's Bookings:", todaysBookings);
            console.log("Future Bookings:", futureBookings);
            console.log("All Bookings:", allBookings);
    
            return { success: true, message: "Bookings retrieved successfully", data: allBookings };
        } catch (error) {
            console.error("Error in getTotalBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getBookedUserRepository(managerName: string) {
        try {
            const events = await SOCIALEVENTDB.find({ companyName: managerName });
            
            if (!events || events.length === 0) {
                return { success: false, message: "No event found for this company", data: null };
            }
    
            const eventIds = events.map(event => event._id);
    
            const bookedUsers = await BOOKEDUSERDB.find({ eventId: { $in: eventIds } });
            
            if (!bookedUsers || bookedUsers.length === 0) {
                return { success: false, message: "No users booked for this event", data: null };
            }
    
            const uniqueEmails = new Set();
            const uniqueBookedUsers = [];
    
            for (const user of bookedUsers) {
                const email = user.billingDetails?.email;
                if (email && !uniqueEmails.has(email)) {
                    uniqueEmails.add(email);
                    uniqueBookedUsers.push(user);
                }
            }
    
            const result = uniqueBookedUsers.map(user => user.billingDetails);
    
            console.log("Final Result:", result);
    
            return { success: true, message: "Data retrieved", data: result };
        } catch (error) {
            console.error("Error fetching booked users:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }


      async createChatSchemaRepository(sender: string, receiver: string) {
            try {
                console.log("Checking", sender,receiver);
        
                const userData = await USERDB.findOne({ firstName: receiver });
                console.log("User Details",userData);
        
                if (!userData) {
                    return { success: false, message: "User not found", data: null };
                }
        
                const userId = new mongoose.Types.ObjectId(userData._id);
                const managerId = new mongoose.Types.ObjectId(sender); // Convert userId to ObjectId
        
                console.log("fgh", managerId, userId);
        
                let conversation = await CONVERSATIONDB.findOne({
                    participants: { $all: [userId, managerId] } // Use ObjectIds directly
                });
        
                if (!conversation) {
                    conversation = new CONVERSATIONDB({
                        participants: [managerId,userId] // Store ObjectIds
                    });
                    await conversation.save();
                }
    
    
                const getAllMessages=await MESSAGEDB.find({chatId:conversation._id});
    
        
                return { success: true, message: "Conversation Schema Created", data: {conversation:conversation,userId:userData._id,allMessages:getAllMessages} };   
            } catch (error) {
                console.error("Error fetching company names:", error);
                return { success: false, message: "Internal server error", data: null };
            }
        }



    
    
    
    
    
    
}

