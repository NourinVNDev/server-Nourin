import { mLoginService } from "../../service/managerService/MloginService"
import { Request,Response } from "express"
import { IMloginService } from "../../service/managerService/IMloginService";
export class managerBookingDetailsControllers{
    private bookingController:IMloginService;
    constructor(managerServiceInstance:IMloginService){
        this.bookingController=managerServiceInstance;
    }

    async getTodaysBookingDetails2(){
        try {
            console.log("Processing manager-specific event logic");
            const result = await this.bookingController.getTodaysBookingService();
            console.log("Event created successfully", result);

            return result;
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }

    }



    async getTotalBookingDetails2(){
        try {
  
            const result = await this.bookingController.getTotalBookingService();
            console.log("Event created successfully", result);

            return result;
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }

    }

    async getBookedUserDetails2(managerName:string){
        try {
            if(!managerName){
                return {success:false,message:"Manager Name  is not Found",data:null};
            }

            const savedEvent = await this.bookingController.getBookedUserService(managerName)
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
            
                const savedEvent = await this.bookingController.createChatSchemaService(formData)
                console.log("Get Booked User Details", savedEvent);
                console.log("From Controller for User Details",savedEvent);
                return {success:savedEvent.success,message:savedEvent.message,data:savedEvent};
                
            } catch (error) {
                console.error("Error in userEventControllers:", error);
                throw new Error("Failed to process user-specific event logic.");
            } 
        }



}