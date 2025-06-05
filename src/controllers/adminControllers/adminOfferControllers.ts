import { OfferData } from "../../config/enum/dto";
import { IadminloginService } from "../../service/adminServices/IadminloginService";
export class adminOfferControllers{
    private adminService:IadminloginService;
        constructor(adminServiceInstance:IadminloginService){
            this.adminService=adminServiceInstance;
        }
        async createNewOfferController(formData:OfferData){
                try {
        
        const result = await this.adminService.postNewOfferServiceDetails(formData)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }}
    async getAllOffers():Promise<any>{
    try {

        const result = await this.adminService.getAllOfferServiceDetails()
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
        const result = await this.adminService.getSelectedOfferService(offerId);
        console.log("Event created successfully", result);

        return result;
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }
} 
async updateOfferController(formData:OfferData):Promise<any>{
    try {
        
        const result = await this.adminService.updateOfferServiceDetails(formData)
        console.log("Event created successfully", result);
        return result;
        
    } catch (error) {
        console.error("Error in managerEventControllers:", error);
        throw new Error("Failed to process manager-specific event logic.");
    }

} 


}