import { IMloginRepo } from "../../repository/managerRepository/IMloginRepo"
export class managerVerifierService{
    private verifierService:IMloginRepo;
    constructor(managerRepositoryInstance:IMloginRepo){
        this.verifierService=managerRepositoryInstance;
    }
    async getAllVerifierService2(){
        try {
            const savedEvent =await this.verifierService.getAllVerifierRepo(); 
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

}