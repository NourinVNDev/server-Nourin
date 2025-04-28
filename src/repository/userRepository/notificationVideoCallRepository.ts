import BOOKEDDB from "../../models/userModels/bookingSchema";
import NOTIFICATIONDB from "../../models/userModels/notificationSchema";
interface NotificationResult {
    success: boolean;
    message: string;
    data: any[] | null;
  }
export  class NotificationVideoCallRepository{
 
      
      async fetchUserNotificationRepository(userId: string): Promise<NotificationResult> {
        try {
    
          const bookedEvents = await BOOKEDDB.find({ userId }).populate('eventId');
          
          if (!bookedEvents || bookedEvents.length === 0) {
            return {
              success: true,
              message: "No booked events found for this user",
              data: []
            };
          }
      
          const virtualEventManagers = bookedEvents
            .filter((event: any) => event.eventId?.title === 'Virtual')
            .map((event: any) => event.eventId?.Manager)
            .filter(Boolean); 
          if (virtualEventManagers.length === 0) {
            return {
              success: true,
              message: "No virtual events found for this user",
              data: []
            };
          }
      
          const notifications = await NOTIFICATIONDB.find({
            
            from: { $in: virtualEventManagers },
            fromModal: 'Manager'
          }).sort({ createdAt: -1 }); 
      
          return {
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications
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
}