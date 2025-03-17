import { verifierFormData } from "../../config/enum/dto"

export interface IVerifierService{
    checkIfManagerActive(email:string):Promise<{success:boolean,message:string,data:any}>
    verifierLoginDetails(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>
    fetchAllEvents(companyName:string):Promise<{success:boolean,message:string,data:any}>
    fetchAllBookingDetails(eventId:string):Promise<{success:boolean,message:string,data:any}>
    markUserEntryService(bookedId:string):Promise<{success:boolean,message:string,data:any}>

}