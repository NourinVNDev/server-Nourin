import { ILoginService } from "../../service/userService/ILoginService";

export class NotificationVideoCallController{
    private videoNotification:ILoginService;
    constructor(userServiceInstance:ILoginService){
        this.videoNotification=userServiceInstance;
    }

async fetchNotificationOfUser(userId:string){
    try {

        const result = await this.videoNotification.fetchUserNotificationService(userId)
        console.log("Fetch Notification successfully", result);
        return {result};
        
    } catch (error) {
        console.error("Error in user Notification Controllers:", error);
        throw new Error("Failed to process user-specific notification logic.");
    }   

}
}
