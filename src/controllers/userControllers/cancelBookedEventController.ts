import { ILoginService } from "../../service/userService/ILoginService";
export class CancelBookedEventController{
    private cancelBookedEvent:ILoginService
    constructor(userServiceInstance:ILoginService){
        this.cancelBookedEvent=userServiceInstance
    }
    async cancelEventBooking(bookingId:string,userId:string){
        try {

            const result = await this.cancelBookedEvent.cancelBookingEventService(bookingId,userId)
            console.log("Event created successfully", result);
            return {result};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 


    }
    async fetchWalletOfUser(userId:string){
        try {

            const result = await this.cancelBookedEvent.fetchUserWalletService(userId)
            console.log("Event created successfully", result);
            return {result};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 

    }


}