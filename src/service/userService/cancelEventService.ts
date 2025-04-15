import { IloginRepo } from "../../repository/userRepository/IloginRepo";
export  class cancelEventService{
    private loginRepository:IloginRepo
    constructor(userRepositoryInstance:IloginRepo){
        this.loginRepository=userRepositoryInstance;
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
  
        
            if (!userId) {
                throw new Error("There is no UserId.");
            }
  
         
            const savedEvent =await this.loginRepository.fetchUserWalletRepo(userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }



}