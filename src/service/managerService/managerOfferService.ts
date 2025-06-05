import { Request,Response } from "express-serve-static-core";
import { mLoginRepo } from "../../repository/managerRepository/MloginRepo";
import { FormData1, OfferData } from "../../config/enum/dto";
import { IMloginRepo } from "../../repository/managerRepository/IMloginRepo";
export class managerOfferService{
    private  managerOfferService:IMloginRepo;

    constructor(managerRepositoryInstance:IMloginRepo){
        this.managerOfferService=managerRepositoryInstance;
    }
    async getOfferService(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
        try {
            const savedEvent =await this.managerOfferService.getAllOfferDetails(managerId); 
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
    async getSearchOfferService(searchData:string):Promise<{success: boolean; message: string; data?: any}>{
        try {
            const savedEvent =await this.managerOfferService.getSearchOfferInput(searchData); 
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

 

    async postOfferService(formData:OfferData){
        try {
            const savedEvent =await this.managerOfferService.postOfferDetails(formData); 
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
    async updateOfferService(formData:OfferData){
        try {
            const savedEvent =await this.managerOfferService.updateOfferDetailsRepo(formData); 
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

    async fetchManagerWalletService2(managerId:string){
        try {
            console.log("For getting manager Wallet,managerId",managerId);
  
            // Perform additional validations if needed
            if (!managerId) {
                throw new Error("There is no ManagerId.");
            }
  
            // Call repository to save the data
            const savedEvent =await this.managerOfferService.fetchManagerWalletRepo(managerId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }



    


    async getSelectedOfferService2(offerId:string,managerId:string) {
        try {
            console.log("Processing event data in another service...");
            const savedEvent =await this.managerOfferService.getSelectedOfferRepo(offerId,managerId);
    
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }






    





    



 
}