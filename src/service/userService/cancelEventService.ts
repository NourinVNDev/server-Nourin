import { IloginRepo } from "../../repository/userRepository/IloginRepo";
export  class cancelEventService{
    private loginRepository:IloginRepo
    constructor(userRepositoryInstence:IloginRepo){
        this.loginRepository=userRepositoryInstence;
    }
    async cancelEventService2(bookingId:string,userId:string){
        try {
            console.log("Processing event data in another service for cancelling the events...",bookingId);
  
            if (!bookingId) {
                throw new Error("There is no BookingId.");
            }
  
            const savedEvent =await this.loginRepository.cancelBookedEventRepo(bookingId,userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }
    async fetchUserWalletService2(userId:string){
        try {
            console.log("For getting user Wallet,userId",userId);
  
            // Perform additional validations if needed
            if (!userId) {
                throw new Error("There is no UserId.");
            }
  
            // Call repository to save the data
            const savedEvent =await this.loginRepository.fetchUserWalletRepo(userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }



}