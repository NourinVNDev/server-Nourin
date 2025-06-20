import { IVerifierDetailsService } from "../../interfaces/managerInterfaces/serviceInterfaces/IVerifierDetailsService";
import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IVerifierDetailsRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IVerifierDetailsRepo";
import { verifierFormData } from "../../dtos/user.dto";

@injectable()
export class VerifierDetailsService implements IVerifierDetailsService{
    constructor(@inject(TYPES.IVerifierDetailsRepo) private _verifeirRepo:IVerifierDetailsRepo){}
    async getAllVerifierService(managerName:string){
  try {
 
    const savedEvent = await this._verifeirRepo.getAllVerifierRepo(managerName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllVerifierServiceDetails:", error);
    throw new Error("Failed to get All Verifier Details."); 
  }

}
async updateVerifierStatusService(verifierId:string){
  try {
 
    const savedEvent = await this._verifeirRepo.updateVerifierStatusRepo(verifierId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllVerifierServiceDetails:", error);
    throw new Error("Failed to get All Verifier Details."); 
  }

}
async postVerifierLoginService(formData:verifierFormData){
  const verifierData = await this._verifeirRepo.postVerifierLoginRepo(formData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }

}
  async fetchSelectedVerifierService(verifierId:string){
    const verifierData = await this._verifeirRepo.fetchSelectedVerifierRepo(verifierId); 

    if (verifierData.success) {
        return {
            success: verifierData.success,
            message: verifierData.message,
            data: verifierData.data
        };
    } else {
        return {
            success: false,
            message: verifierData.message,
            data: verifierData.data
        };
    }

   }
   async updateVerifierService(formData:verifierFormData){
  const verifierData = await this._verifeirRepo.updateVerifierRepo(formData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }
}



}