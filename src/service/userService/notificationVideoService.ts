import { IloginRepo } from "../../repository/userRepository/IloginRepo";
import { ILoginService } from "./ILoginService";

export class NotificationVideoCallService{
    private videoNotificationService:IloginRepo;
    constructor(userRepositoryInstance:IloginRepo){
        this.videoNotificationService=userRepositoryInstance

    }
    async fetchUserNotificationService2(userId:string){
        try {
            console.log("For getting user Notification,userId",userId);
  
        
            if (!userId) {
                throw new Error("There is no UserId.");
            }
  
         
            const savedEvent =await this.videoNotificationService.fetchUserNotificationRepo(userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handle User Notification:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }
    async fetchUserNotificationCountService2(userId:string){
        try {
            console.log("For getting user Notification,userId",userId);
  
        
            if (!userId) {
                throw new Error("There is no UserId.");
            }
  
         
            const savedEvent =await this.videoNotificationService.fetchUserNotificationCountRepo(userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handle User Notification Count:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }
}