import { IMloginService } from "../../service/managerService/IMloginService";
import { Request,Response } from "express";
export class managerVerifierDetailsControllers{
    private managerController:IMloginService
    constructor(managerServiceInstance:IMloginService){
        this.managerController=managerServiceInstance;
    }

    async getAllVerifierDetails(){
        try {

            const result = await this.managerController.getAllVerifierService()
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

    

}