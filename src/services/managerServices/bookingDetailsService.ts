import { IBookingDetailsService } from "../../interfaces/managerInterfaces/serviceInterfaces/IBookingDetailsService";
import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IBookingDetailsRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IBookingDetailsRepo";
@injectable()
export class BookingDetailsService implements IBookingDetailsService{
    constructor(
        @inject(TYPES.IBookingDetailsRepo) private _bookingRepo:IBookingDetailsRepo
    ){}
      async getTodaysBookingService(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
    try {
      // Fetch data from the repository
      const result = await this._bookingRepo.getTodaysBookingRepo(managerId);

       return { success: result.success, message: result. message, data: result.data };
  
    } catch (error) {
      // Log and return a generic error response
      console.error("Error in getAllOfferServiceDetails:", error);
      throw new Error("Failed to create event in another service layer."); 
    }
} 
async getTotalBookingService(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {
    // Fetch data from the repository
    const result = await this._bookingRepo.getTotalBookingRepo(managerId);
    console.log("from total booking", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
} 
 async getBookedUserService(managerName: string){
  try {
 
    const savedEvent = await this._bookingRepo.getUserDataRepo(managerName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

}