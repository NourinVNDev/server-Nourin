import { verifierFormData } from "../../config/enum/dto"

export interface IVerifierRepo{
    checkTheManagerIsActive(email:string):Promise<{success:boolean,message:string,data:any}>
    saveVerifierDetailsRepo(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>
    fetchAllCompanyEventRepo(companyName:string):Promise<{success:boolean,message:string,data:any}>
    fetchAllBookingDetailsRepo(eventId:string):Promise<{success:boolean,message:string,data:any}>
    markUserEntryRepo(bookedId:string):Promise<{success:boolean,message:string,data:any}>

    

    
}