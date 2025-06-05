import { OfferData } from "../../config/enum/dto";
import { IAloginRepo } from "../../repository/AdminRepository/IAloginRepo";
export class adminOfferService {
    private adminRepo: IAloginRepo;
    constructor(adminRepositoryInstance: IAloginRepo) {
        this.adminRepo = adminRepositoryInstance;

    }
    async postOfferService(formData:OfferData){
            try {
            const savedEvent =await this.adminRepo.postOfferDetails(formData); 
            console.log("Saved Data",savedEvent);
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
       async getOfferService():Promise<{ success: boolean; message: string; data?: any }>{
        try {
            const savedEvent =await this.adminRepo.getAllOfferDetails(); 
            console.log("Saved Data",savedEvent);
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
        async updateOfferService(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>{
            try {
                const savedEvent =await this.adminRepo.updateOfferDetailsRepo(formData); 
                console.log("Saved Data",savedEvent);
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
    
        async getSelectedOfferService2(offerId:string) {
            try {
                console.log("Processing event data in another service...");
        
        
        
                // Call repository to save the data
                const savedEvent =await this.adminRepo.getSelectedOfferRepo(offerId);
        
                return savedEvent;
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            }
        }

}