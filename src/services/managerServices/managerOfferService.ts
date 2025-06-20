import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IManagerOfferRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IManagerOfferRepo";
import { IManagerOfferService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerOfferService";
import { OfferData } from "../../dtos/user.dto";
@injectable()
export class ManagerOfferService implements IManagerOfferService{
    constructor(
        @inject(TYPES.IManagerOfferRepo) private _offerRepo:IManagerOfferRepo
    ){}
    async getAllOfferService(
managerId:string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await this._offerRepo.getAllOfferRepo(managerId);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async postNewOfferService(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    console.log('checking the formData',formData);
    const result = await this._offerRepo.postOfferRepo(formData);
    console.log("from service", result);
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
    console.error("Error in postNewOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer.");
  }
}
async getSelectedOfferService(offerId:string,managerId:string) {
    try {
      const result = await this._offerRepo.getSelectedOfferRepo(offerId,managerId);
      console.log("from service", result);
       return { success: result.success, message: result. message, data: result.data };
  
    } catch (error) {
      // Log and return a generic error response
      console.error("Error in getAllOfferServiceDetails:", error);
      throw new Error("Failed to create event in another service layer."); 
    }
  }
  async updateOfferService(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {
 
    console.log('checking the formData',formData)
    const result = await this._offerRepo.updateOfferDetailsRepo(formData);
  
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
    console.error("Error in postNewOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer.");
  }
}

  async getSearchOfferInputService(searchData:string):Promise<{success: boolean; message: string; data?: any }>{
    try {
        const savedEvent =await this._offerRepo.getSearchOfferInputRepo(searchData); 
    
        if(savedEvent){
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
        }else{
            return { success: false, message: "Not Found Offer Details data " };
        }
    
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer."); 
    }

}
async fetchManagerWalletService(managerId:string){
    try {
            if (!managerId) {
                throw new Error("There is no ManagerId.");
            }
      const savedEvent = await this._offerRepo.fetchManagerWalletRepo(managerId);
      return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    } catch (error) {
      console.error("Error in cancelling the booked Event:", error);
      throw new Error("Failed to cancell the booked Event"); 
    }

}




}