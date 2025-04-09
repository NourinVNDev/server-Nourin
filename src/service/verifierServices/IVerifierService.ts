import { verifierFormData } from "../../config/enum/dto"

export interface IVerifierService{
    checkIfVerifierActive(email:string):Promise<{success:boolean,message:string,data:any}>
    verifierLoginDetails(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>
    fetchAllEvents(email:string):Promise<{success:boolean,message:string,data:any}>
    fetchAllBookingDetails(eventId:string):Promise<{success:boolean,message:string,data:any}>
    markUserEntryService(bookedId:string):Promise<{success:boolean,message:string,data:any}>

}