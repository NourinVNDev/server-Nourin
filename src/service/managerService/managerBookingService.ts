import { mLoginRepo } from "../../repository/managerRepository/MloginRepo";
import { IMloginRepo } from "../../repository/managerRepository/IMloginRepo";
export class managerBookingService{
private  managerBookingService:IMloginRepo;
constructor(managerRepositoryInstance:IMloginRepo){
    this.managerBookingService=managerRepositoryInstance;
}
async getTodaysBookingDetails2(){
    try {
        console.log("Processing event data in another service...");



        // Call repository to save the data
        const savedEvent =await this.managerBookingService.getTodaysBookingRepo();

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}

async getTotalBookingDetails2(){
    try {
        const savedEvent =await this.managerBookingService.getTotalBookingRepo();

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}

}