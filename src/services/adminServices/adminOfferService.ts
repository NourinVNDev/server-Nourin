import { injectable,inject } from "inversify";
import { IAdminOfferService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminOfferService";
import TYPES from "../../inversify/types";
import { IAdminOfferRepo } from "../../interfaces/adminInterfaces/repositoryInterfaces/IAdminOfferRepo";
import { OfferData } from "../../dtos/user.dto";
@injectable()
export class AdminOfferService implements IAdminOfferService{
    constructor(@inject(TYPES.IAdminOfferRepo) private _offerRepo:IAdminOfferRepo){}

        async postNewOfferService(formData:OfferData) {
      try {
    
        console.log('checking the formData',formData);
        const result = await this._offerRepo.addNewOfferRepo(formData);
        console.log("from service", result);
        return { success: result.success, message: result.message, data: result.data };
      } catch (error) {
        console.error("Error in postNewOfferServiceDetails:", error);
        throw new Error("Failed to create event in another service layer.");
      }
    }
     async getAllOfferService() {
      try {
        const result = await this._offerRepo.getAllOfferRepo();
        console.log("from service", result);
         return { success: result.success, message: result. message, data: result.data };
    
      } catch (error) {
        console.error("Error in getAllOfferServiceDetails:", error);
        throw new Error("Failed to create event in another service layer."); 
      }
    }
       async getSelectedOfferService(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
        try {
          // Fetch data from the repository
          const result = await this._offerRepo.getSelectedOfferRepo(offerId);
          console.log("from service", result);
           return { success: result.success, message: result. message, data: result.data };
      
        } catch (error) {
          // Log and return a generic error response
          console.error("Error in getAllOfferServiceDetails:", error);
          throw new Error("Failed to create event in another service layer."); 
        }
      }
      async updateOfferService(formData:OfferData) {
  try {
 
    console.log('checking the formData',formData)
    const result = await this._offerRepo.updateOfferDetailsRepo(formData);
    console.log("from service", result);
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
    console.error("Error in postNewOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer.");
  }
}


}