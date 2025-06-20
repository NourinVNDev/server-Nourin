import { inject, injectable } from "inversify";
import { IRetryEventService } from "../../interfaces/userInterfaces/serviceInterfaces/IRetryEventPaymentService";
import TYPES from "../../inversify/types";
import { IRetryEventRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IRetryEventPaymentRepo";
@injectable()
export class RetryEventPaymentService implements IRetryEventService{
    constructor(
        @inject(TYPES.IRetryEventRepo) private _retryPaymentRepo:IRetryEventRepo
    ){}
       async cancelBookingEventService(bookingId:string,userId:string){
        try {
            console.log("Processing event data in another service for cancelling the events...",bookingId);
  
            if (!bookingId) {
                throw new Error("There is no BookingId.");
            }
  
            const savedEvent =await this._retryPaymentRepo.cancelBookedEventRepo(bookingId,userId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }
    async fetchUserWalletService(userId:string){
  try {
        if (!userId) {
                throw new Error("There is no UserId.");
            }
    const savedEvent = await this._retryPaymentRepo.fetchUserWalletRepo(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in cancelling the booked Event:", error);
    throw new Error("Failed to cancell the booked Event"); 
  }

}

}