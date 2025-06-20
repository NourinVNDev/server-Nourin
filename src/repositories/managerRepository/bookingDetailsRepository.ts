import { IBookingDetailsRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IBookingDetailsRepo";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import USERDB from "../../models/userModels/userSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
export class BookingDetailsRepository implements IBookingDetailsRepo{

    async getTodaysBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
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
async getTotalBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
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

async getUserDataRepo(managerName:string){
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
            unreadCount,
            updatedAt:convo.updatedAt

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



}