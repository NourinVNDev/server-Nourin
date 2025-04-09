import { TicketType, verifierFormData } from "../../config/enum/dto";
import { IMloginService } from "../../service/managerService/IMloginService";
import { Request,Response } from "express";
export class managerVerifierDetailsControllers{
    private managerController:IMloginService
    constructor(managerServiceInstance:IMloginService){
        this.managerController=managerServiceInstance;
    }

    async getAllVerifierDetails(managerName:string){
        try {

            const result = await this.managerController.getAllVerifierService(managerName)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }

    }
    async updateVerifierStatusController(verifierId:string){
        try {

            const result = await this.managerController.updateVerifierStatusService(verifierId)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }
    }
    async postVerifierLoginDetails(formData:verifierFormData){
        try {

            const result = await this.managerController.postVerifierLoginService(formData)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }
    }
    async updateVerifierDetails(formData:verifierFormData){
        try {

            const result = await this.managerController.updateVerifierService(formData)
            console.log("update Verifier successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }
    }
    async fetchSelectedVerifierData(verifierId:string){
        try {

            const result = await this.managerController.fetchSelectedVerifierService(verifierId)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }
    }


    

}