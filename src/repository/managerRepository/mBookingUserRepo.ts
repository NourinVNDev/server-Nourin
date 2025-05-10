import { send } from "node:process";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import USERDB from "../../models/userModels/userSchema";
import mongoose from "mongoose";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
export class managerBookingRepository {
    async getTodaysBookingRepository(managerId: string) {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

            // First, find all events managed by this manager
            const managerEvents = await SOCIALEVENTDB.find({
                Manager: managerId
            }, { _id: 1, eventName: 1 });

            // Get the event IDs managed by this manager
            const managerEventIds = managerEvents.map(event => event._id);

            // Get today's bookings for only this manager's events
            const result = await BOOKEDUSERDB.find({
                bookingDate: { $gte: startOfDay, $lte: endOfDay },
                eventId: { $in: managerEventIds }
            }).populate({
                path: 'eventId',
                select: 'eventName'
            });

            console.log("Manager's Today's Bookings:", result);
            return {
                success: true,
                message: "Manager's today's bookings retrieved successfully",
                data: result
            };
        } catch (error) {
            console.error("Error in getTodaysBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getTotalBookingRepository(managerId: string) {
        try {

            const managerEvents = await SOCIALEVENTDB.find({
                Manager: managerId
            }, { _id: 1 });


            const managerEventIds = managerEvents.map(event => event._id);


            if (managerEventIds.length === 0) {
                return {
                    success: true,
                    message: "No events found for this manager",
                    data: {
                        bookings: [],
                        totalCount: 0
                    }
                };
            }


            const allBookings = await BOOKEDUSERDB.find({
                eventId: { $in: managerEventIds }
            }).populate({
                path: 'eventId',
                select: 'eventName'
            });

            console.log("Manager's Total Bookings:", allBookings.length);

            return {
                success: true,
                message: "Manager's bookings retrieved successfully",
                data: allBookings,


            };
        } catch (error) {
            console.error("Error in getTotalBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getBookedUserRepository(managerName: string) {
        try {
            console.log("Yeah");
    
            const manager = await MANAGERDB.findOne({ firmName: managerName });
            console.log("Checking Manager",manager);
            
            if (!manager) {
                return { success: false, message: "Manager not found", data: null };
            }
                   const conversations = await CONVERSATIONDB.find({
                        participants: manager._id
                      });
                  
                      if (!conversations.length) {
                        return {
                          success: false,
                          message: "No conversations found",
                          data: null
                        };
                      }
                   
                
                    let result=[];
          for (const convo of conversations) {
            const userId = convo.participants.find(
              (id: any) => id.toString() !== manager._id
            );
            if (!userId) continue;
            const user=await USERDB.findById(userId);
            
            const unreadCount = await MESSAGEDB.countDocuments({
                chatId: convo._id,
                senderId: userId,
                isRead: false
              });
            // userIds.push(userId.toString());
            let lastMessage=null;
                   const message = await MESSAGEDB.findById(convo.lastMessage).lean();
                  
                        if (message) {
                          lastMessage={
                            message: message.message,
                            time: message.createdAt,
                            // count:unreadCount
                          };
         }

         result.push({

            chatId:convo._id,
            companyName:user?.firstName,

            lastMessage,
            unreadCount

         })
        }
   
            return {
                success: true,
                message: "Data retrieved",
                data: result
            };
    
        } catch (error) {
            console.error("Error fetching booked users:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }
    
    


    async createChatSchemaRepository(sender: string, receiver: string) {
        try {
            console.log("Checking", sender, receiver);

            const userData = await USERDB.findOne({ firstName: receiver });
            console.log("User Details", userData);

            if (!userData) {
                return { success: false, message: "User not found", data: null };
            }

            const userId = new mongoose.Types.ObjectId(userData._id);
            const managerId = new mongoose.Types.ObjectId(sender);

            console.log("fgh", managerId, userId);

            let conversation = await CONVERSATIONDB.findOne({
                participants: { $all: [userId, managerId] }
            });

            if (!conversation) {
                conversation = new CONVERSATIONDB({
                    participants: [managerId, userId] // Store ObjectIds
                });
                await conversation.save();
            }


            const getAllMessages = await MESSAGEDB.find({ chatId: conversation._id });
            const messageCount = await MESSAGEDB.find({ senderId: userId }); // Use userId instead of receiver

        await Promise.all(messageCount.map(async (message) => {
            message.isRead = true;
            await message.save();
        }));
         

            return { success: true, message: "Conversation Schema Created", data: { conversation: conversation, userId: userData._id, allMessages: getAllMessages, } };
        } catch (error) {
            console.error("Error fetching company names:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }









}

