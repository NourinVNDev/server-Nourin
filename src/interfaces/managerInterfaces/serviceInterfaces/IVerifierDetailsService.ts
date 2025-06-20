import { verifierFormData } from "../../../dtos/user.dto";

export interface IVerifierDetailsService{
       getAllVerifierService(managerName:string):Promise<{success:boolean,message:string,data:any}>;
          updateVerifierStatusService(verifierId:string):Promise<{success:boolean,message:string,data:any}>;
            postVerifierLoginService(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>;
               fetchSelectedVerifierService(verifierId:string):Promise<{success:boolean,message:string,data:any}>;
                  updateVerifierService(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>;
                  

}