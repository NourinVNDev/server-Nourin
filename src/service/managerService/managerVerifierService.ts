import { TicketType, verifierFormData } from "../../config/enum/dto";
import { IMloginRepo } from "../../repository/managerRepository/IMloginRepo"
export class managerVerifierService{
    private verifierService:IMloginRepo;
    constructor(managerRepositoryInstance:IMloginRepo){
        this.verifierService=managerRepositoryInstance;
    }
    async getAllVerifierService2(managerName:string){
        try {
            const savedEvent =await this.verifierService.getAllVerifierRepo(managerName); 
            console.log("Saved Verifier Data",savedEvent);
            if(savedEvent){
                return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
            }else{
                return { success: false, message: "Not Found Offer Details data " };
            }
        
        } catch (error) {
            console.error("Error in handle verifier fetching:", error);
            throw new Error("Failed to fetch all the verifier."); 
        }

    }
    async updateVerifierStatusService2(verifierId:string){
        try {
            const savedEvent =await this.verifierService.updateVerifierStatusRepo(verifierId); 
            console.log("update Verifier status Data",savedEvent);
            if(savedEvent){
                return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
            }else{
                return { success: false, message: "Not update verifier Details data " };
            }
        
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer."); 
        }

    }
    async postVerifierLoginService2(formData:verifierFormData){
        try {
            console.log("Hello World",formData);
            
            const savedEvent =await this.verifierService.postVerifierLoginRepo(formData); 
            console.log("update Verifier status Data",savedEvent);
        return savedEvent;
        
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer."); 
        }
    }
    async updateVerifierService2(formData:verifierFormData){
        try {
            const savedEvent =await this.verifierService.updateVerifierRepo(formData); 
            console.log("update Verifier status Data",savedEvent);
        return savedEvent;
        
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer."); 
        }
    }
    async fetchSelectedVerifierService2(verifierId:string){
        try {
            console.log("fetching");
            
            const savedEvent =await this.verifierService.fetchSelectedVerifierRepo(verifierId); 
            console.log("fetching selected verifier data ",savedEvent);
        return savedEvent;
        
        } catch (error) {
            console.error("Error in handlefetchingVerifier:", error);
            throw new Error("Failed to fetch verifier Data."); 
        }
    }


}