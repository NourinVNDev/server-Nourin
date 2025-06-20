import { verifierFormData } from "../../../dtos/user.dto";

export interface IVerifierDetailsRepo{
        getAllVerifierRepo(managerName:string):Promise<{ success: boolean; message: string; data?: any }>
            updateVerifierStatusRepo(verifierId:string):Promise<{ success: boolean; message: string; data?: any }>
                postVerifierLoginRepo(formData:verifierFormData):Promise<{ success: boolean; message: string; data?: any }>
                    fetchSelectedVerifierRepo(verifierId:string):Promise<{ success: boolean; message: string; data?: any }>
                        updateVerifierRepo(formData:verifierFormData):Promise<{ success: boolean; message: string; data?: any }>
                        


}