import ADMINDB from "../../models/adminModels/adminSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import BOOKINGDB from "../../models/userModels/bookingSchema";
import NOTIFICATIONDB from "../../models/userModels/notificationSchema";

export class NotificationSocketRepository {
  static async addNewNotification(senderId: string, receiverId: string, message: string, heading: string,eventName:string) {
    try {
      console.log("From Notification", senderId, receiverId, message);
      const notificationSchema = await NOTIFICATIONDB.create({
        heading: heading,
        message: message,
        isRead: false,
        from: senderId,
        fromModal: 'bookedUser',
        to: receiverId, 
        toModal: 'Manager'
      })
      await notificationSchema.save();

      const userNotificationSchema = await NOTIFICATIONDB.create({
        heading: heading,
        message: `Thank you for your payment! Your registration for the ${eventName} is confirmed.`,
        isRead: false,
        to: senderId,
        toModal: 'bookedUser'
      })
      await userNotificationSchema.save();
      

      const notification = await NOTIFICATIONDB.find({ toModal: 'Manager',to:receiverId ,isRead:false});
      const userNotification=await NOTIFICATIONDB.find({toModal:'bookedUser',to:senderId,isRead:false});
      const unreadCount =notification.length;
      const userUnreadCount=userNotification.length;
      return { unreadCount,userUnreadCount}


    } catch (error) {
      console.error('Error creating shared notification:', error);
      throw error;
    }


  }

  static async  changeIsReadStatus(senderId:string,role:string){
    try {
      console.log("Manager as SenderId:",senderId);
      
      const notifiication=await NOTIFICATIONDB.find({to:senderId,toModal:role});
      notifiication.map((note:any)=>note.isRead=true);

      console.log(' Manager side Notification',notifiication);
    
    } catch (error) {
    console.error('Error creating shared notification:', error);
      throw error;
    }
  }
  static async addCategoryNotification(categoryName: string) {
    try {

      const admin = await ADMINDB.find();
      const notificationSchema = await NOTIFICATIONDB.create({
        heading: 'New Category Created',
        message: ` Your ${categoryName} has been successfully created and added.`,
        isRead: false,
        from: admin[0]._id,
        fromModal: 'Admin',
        toModal: 'Manager'


      })
      await notificationSchema.save();
      const notification = await NOTIFICATIONDB.find({ toModal: 'Manager' });
      const unreadCount = notification.map((note: any) => note.isRead === false);

      const manager = await MANAGERDB.find();
      const managerIds = manager.map((man: any) => man._id)
      return { managerIds, unreadCount };
    } catch (error) {
      console.error('Error creating shared notification:', error);
      throw error;
    }



  }
  static async addNewEventNotification(senderId: string, message: string) {
    try {
      const notificationSchema = await NOTIFICATIONDB.create({
        heading: 'New Event Alert!',
        message: message,
        isRead: false,
        from: senderId,
        fromModal: 'Manager',
        toModal: 'User'


      })
      await notificationSchema.save();

    } catch (error) {
      console.error('Error creating shared notification:', error);
      throw error;

    }
  }

  static async shareVideoCallLink(joinLink: string, managerId: string, eventId: string) {
    try {
      const bookings = await BOOKINGDB.find({ eventId });

      const userIds = bookings.map((booking: any) => booking.userId);
      console.log("JoinLink", joinLink);
      const shortLinkText = joinLink.length > 30 ? joinLink.slice(0, 30) + '...' : joinLink;


      const notifications = userIds.map(userId => ({
        heading: 'Join Your Virtual Event',
        message: `Click <a href="${joinLink}" target="_self">${shortLinkText}</a> to join live stream.`,
        isRead: false,
        from: managerId,
        fromModal: 'Manager',
        toModal: 'bookedUser',
        to: userId
      }));

      await NOTIFICATIONDB.insertMany(notifications);
      const unreadCount = await NOTIFICATIONDB.countDocuments({
        from: managerId,
        isRead: false
      });




      return { userIds, unreadCount };
    } catch (error) {
      console.error('Error creating shared notification:', error);
      throw error;
    }
  }


}
