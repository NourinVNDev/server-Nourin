import NOTIFICATIONDB from "../../models/userModels/notificationSchema";

export class NotificationSocketRepository{
    static async addNewNotification(senderId:string,receiverId:string,message:string,heading:string){
        try {
            console.log("From Notification",senderId,receiverId,message);
            const notificationSchema=await NOTIFICATIONDB.create({
                heading:heading,
                message:message,
                isRead:false,
                from:senderId,
                fromModal:'User',
                to:receiverId,
                toModal:'Manager'


            })
            await notificationSchema.save();

            
            
        } catch (error) {
            
        }

    }

}