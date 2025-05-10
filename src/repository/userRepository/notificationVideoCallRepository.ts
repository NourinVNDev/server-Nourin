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
  
      // Mark all these notifications as read
      const notificationIds = notifications.map((n: any) => n._id);
      if (notificationIds.length > 0) {
        await NOTIFICATIONDB.updateMany(
          { _id: { $in: notificationIds } },
          { $set: { isRead: true } }
        );
      }

      console.log("Notification:",notifications);
      
  
      return {
        success: true,
        message: "Notifications retrieved and marked as read",
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
  
      async fetchUserNotificationCountRepository(userId: string) {
        try {
          const bookedEvents = await BOOKEDDB.find({ userId }).populate('eventId');
      
          if (!bookedEvents || bookedEvents.length === 0) {
            return {
              success: true,
              message: "No booked events found for this user",
              data: 0
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
              data: 0
            };
          }
      
          const count = await NOTIFICATIONDB.countDocuments({
            from: { $in: virtualEventManagers },
            fromModal: 'Manager',
            isRead: false
          });
      
          return {
            success: true,
            message: "Unread notifications count retrieved successfully",
            data: count
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