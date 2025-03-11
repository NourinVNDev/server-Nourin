
import { EventData, EventSeatDetails, FormData, OfferData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";
export interface IMloginService{
    CheckingEmail(email:string):Promise<boolean|string>;
    MverifyService(formData:FormData,otp:string,globalOTP:string|number|null):Promise<{success:boolean;message:string;user:any|null}>;
    mloginDetails(formData:FormData):Promise<{success:boolean;message:string;user:any|null}>;
    managerForgotEmail(email:string):Promise<{success:boolean,message:string,otpValue:string|null}>;
    resetPasswordDetailsForManager(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user:any}>;
    verifyOtpForForgot(email:string,otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string}>
    getManagerProfileService(companyName:string):Promise<{success:boolean,message:string,data?:any}>
    updateManagerProfileService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
    updateManagerPasswordService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
    getEventTypeDataService(req:Request):Promise<{success:boolean,message:string,data?:any}>
    getAllOfferServiceDetails(req:Request,res:Response):Promise<{success:boolean,message:string,data?:any}>
   getSearchOfferInput(searchData:string):Promise<{success:boolean,message:string,data?:any}>
   postNewOfferServiceDetails(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
   updateOfferServiceDetails(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
   getSelectedOfferService(offerId:string):Promise<{success:boolean,message:string,data?:any}>
   createEventPostService(formData:EventData,file:Express.Multer.File):Promise<{success:boolean,message:string,data?:any}>
   createEventSeatService(formData:EventSeatDetails,eventId:string):Promise<{success:boolean,message:string,data?:any}>
   updateEventPostService(formData:EventData,fileNames:Express.Multer.File[],eventId:string):Promise<{success:boolean,message:string,data?:any}>
   getAllEventService(req:Request,res:Response):Promise<{success:boolean,message:string,data?:any}>
   getSelectedEventService(id:string):Promise<{success:boolean,message:string,data?:any}>
   getTodaysBookingService():Promise<{success:boolean,message:string,data?:any}>
   getTotalBookingService():Promise<{success:boolean,message:string,data?:any}>
   getBookedUserService(managerName:string):Promise<{success:boolean,message:string,data:any}>;
   createChatSchemaService(formData:FormData):Promise<{success:boolean,message:string,data:any}>;
   
}
