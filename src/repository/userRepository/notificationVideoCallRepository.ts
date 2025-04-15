import NOTIFICATIONDB from "../../models/userModels/notificationSchema";

export  class NotificationVideoCallRepository{
async fetchUserNotificationRepository(userId:string){
    try {
        const notificationData=await NOTIFICATIONDB.find({
            to:userId

        })
        console.log(notificationData);
        return {
            success: true,
            message: "Retrive User Wallet successfully",
            data: notificationData,
          };
        
    } catch (error) {
        console.error("Error fetching notification:", error);
        return {
          success: false,
          message: "Error occurred during fetching notification",
          data: null,
        };
    }
}
}