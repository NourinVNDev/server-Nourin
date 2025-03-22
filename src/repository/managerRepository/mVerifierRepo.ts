import VERIFIERDB from "../../models/verifierModals/verifierSchema";
export class managerVerifierRepository {
    async getAllVerifierRepository() {
        try {
            const result = await VERIFIERDB.find(); // Fetch data from the database
         
            console.log("Verifier data from Repository", result);
            return { success: true, message: "Verifier Data retrieved successfully", data: { result } };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }

    }
    async updateVerifierStatusRepository(verifierId: string) {
        try {
            const result = await VERIFIERDB.findById({ _id: verifierId }); 
            if (result) {  
                result.status = 'confirmed';  
                await result.save(); 
                console.log("Updated Verifier status from Repository", result);
                return { success: true, message: "Verifier status updated successfully", data: result };
            } else {
                return { success: false, message: "Verifier not found" };
            }
        } catch (error) {
            console.error("Error in updateVerifierStatusRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    
}