import { INotificationVideoCallRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/INotificationVideoCallRepo";
import NOTIFICATIONDB from "../../models/userModels/notificationSchema";
import USERBOOKEDDB from "../../models/userModels/bookingSchema";

export class NOtificationVideoCallRepository implements INotificationVideoCallRepo{
    async fetchUserNotificationRepo(userId:string){
  try {
    const bookedEvents = await USERBOOKEDDB.find({ userId }).populate('eventId');
    console.log("BookedEvent",bookedEvents);
    
    const virtualEventManagers = bookedEvents
      .filter((event: any) => event.eventId?.title === 'Virtual')
      .map((event: any) => String(event.eventId?.Manager))
      .filter(Boolean);


      console.log("VirtualManager",virtualEventManagers);


    const messages = await NOTIFICATIONDB.find({
      to: userId,
      toModal: 'bookedUser'
    });

    const messageIds = messages.map((n: any) => n._id);
    if (messageIds.length > 0) {
      await NOTIFICATIONDB.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isRead: true } }
      );
    }


    const allNotifications = messages;


    console.log("AllNotification",allNotifications);
    

    return {
      success: true,
      message: "Notifications and messages retrieved and marked as read",
      data: allNotifications 
    };

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch notifications",
      data: null
    };
  }
}
async fetchUserNotificationCountRepo(userId:string){
   try {
          console.log("maango",userId);
          
          const bookedEvents = await USERBOOKEDDB.find({ userId }).populate('eventId');
      
      
      
          const virtualEventManagers = bookedEvents
            .filter((event: any) => event.eventId?.title === 'Virtual')
            .map((event: any) => event.eventId?.Manager)
            .filter(Boolean);
      
         
      
          const count = await NOTIFICATIONDB.countDocuments({
            from: { $in: virtualEventManagers },
            fromModal: 'Manager',
            isRead: false
          });

          const messageCount=await NOTIFICATIONDB.countDocuments({
            toModal:'bookedUser',
            to:userId,
            isRead:false
          })

          const totalCount=count+messageCount
          console.log("TotalCount:",totalCount);
          
      
          return {
            success: true,
            message: "Unread notifications count retrieved successfully",
            data: totalCount
          };
      
        } catch (error) {
          console.error("Error fetching notification count:", error);
          return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch notification count",
            data: null
          };
        }

}

}