import { injectable,inject } from "inversify";
import { INotificationVideoCallService } from "../../interfaces/userInterfaces/serviceInterfaces/INotificationVideoCallService";
import TYPES from "../../inversify/types";
import { INotificationVideoCallRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/INotificationVideoCallRepo";

@injectable()
export class NotificationVideoCallService implements INotificationVideoCallService{
    constructor(
        @inject(TYPES.INotificationVideoCallRepo) private _notificationVideoCallRepo:INotificationVideoCallRepo
    ){}
    async  fetchUserNotificationService(userId:string){
  try {
        if (!userId) {
                throw new Error("There is no UserId.");
            }
  
         
            const savedEvent =await this._notificationVideoCallRepo.fetchUserNotificationRepo(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}

async fetchUserNotificationCountService(userId:string){
  try {
            if (!userId) {
                throw new Error("There is no UserId.");
            }
            const savedEvent =await this._notificationVideoCallRepo.fetchUserNotificationCountRepo(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}
}