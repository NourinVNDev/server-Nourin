import { Request,response,Response } from "express";
import { mLoginService } from "../../service/managerService/MloginService";
import { FormData, OfferData } from "../../config/enum/dto";
// import FormData  from "form-data";
import { IMloginService } from "../../service/managerService/IMloginService";
export class managerOfferControllers{
    private managerController:IMloginService;

constructor(managerServiceInstance:IMloginService){
    this.managerController=managerServiceInstance;

}
async getAllOffers(req:Request,res:Response):Promise<any>{
    try {

        const result = await this.managerController.getAllOfferServiceDetails(req,res)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }

}

async getSearchOfferInput(req:Request,res:Response):Promise<any>{
    try {

        const searchData=req.params.searchData;
        console.log("SearchDaata:",searchData);
        
        const result = await this.managerController.getSearchOfferInput(searchData)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }
}
async createNewOfferController(formData:OfferData):Promise<any>{
    try {
        
        const result = await this.managerController.postNewOfferServiceDetails(formData)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }

}
async updateOfferController(formData:OfferData):Promise<any>{
    try {
        
        const result = await this.managerController.updateOfferServiceDetails(formData)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }

}


async getSelectedOfferDataService(offerId:string): Promise<any> {
    console.log('hai');
    
    try {
        console.log("Processing manager-specific event logic");
        const result = await this.managerController.getSelectedOfferService(offerId);
        console.log("Event created successfully", result);

        return result;
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }
}  





}