import { loginServices } from "../../service/userService/loginService";
import { FormData } from "../../config/enum/dto";
import { ILoginService } from "../../service/userService/ILoginService";
export class userProfileController{
    private loginService:ILoginService;
    constructor(userServiceInstance:ILoginService){
        this.loginService=userServiceInstance;
    }
    async addReviewRatingController(formData:FormData){
        try {

            const result = await this.loginService.posthandleReviewRating(formData)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }
    async getEventHistoryDetails2(){
        try {

            const savedEvent = await this.loginService.getEventHistoryService()
            console.log("Event Retriving for Event History", savedEvent);
            console.log("From Controller",savedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }

    async getExistingReviewDetails2(userId:string,eventId:string){
        try {
    

            const savedEvent = await this.loginService.getExistingReviewService(userId,eventId)
            console.log("Event Retriving for Event History", savedEvent);
            console.log("From Controller",savedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }


    

    async getEventBookedDetails2(){
        try {

            const savedEvent = await this.loginService.getEventBookedService()
            console.log("Event Retriving for Event History", savedEvent);
            console.log("From Controller",savedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }




    async getBookedManagerDetails2(userId:string){
        try {
            if(!userId){
                return {success:false,message:"userId is not Found",data:null};
            }

            const savedEvent = await this.loginService.getBookedManagerService(userId)
            console.log("Get Booked Manager Details", savedEvent);
            console.log("From Controller for Manager Details",savedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }

    


    async createChatSchema2(formData:FormData){
        try {
         

            const savedEvent = await this.loginService.createChatSchemaService(formData)
            console.log("Get Booked Manager Details", savedEvent);
            console.log("From Controller for Manager Details",savedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }





    

    



    
    


    



}