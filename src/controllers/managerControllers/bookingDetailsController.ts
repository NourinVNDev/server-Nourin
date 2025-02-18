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


}