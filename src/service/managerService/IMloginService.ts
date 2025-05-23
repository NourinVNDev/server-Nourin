
import { EventData, EventSeatDetails, FormData, OfferData, TicketType, verifierFormData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";
export interface IMloginService{
    CheckingEmail(email:string):Promise<boolean|string>;
    MverifyService(formData:FormData,otp:string,globalOTP:string|number|null):Promise<{success:boolean;message:string;user:any|null}>;
    mloginDetails(formData:FormData):Promise<{success:boolean;message:string;user:any|undefined}>;
    managerForgotEmail(email:string):Promise<{success:boolean,message:string,otpValue:string|null}>;
    resetPasswordDetailsForManager(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user:any}>;
    verifyOtpForForgot(email:string,otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string}>
    getManagerProfileService(companyName:string):Promise<{success:boolean,message:string,data?:any}>
    updateManagerProfileService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
    updateManagerPasswordService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
    getEventTypeDataService(req:Request):Promise<{success:boolean,message:string,data?:any}>
    getAllOfferServiceDetails(managerId:string):Promise<{success:boolean,message:string,data?:any}>
   getSearchOfferInput(searchData:string):Promise<{success:boolean,message:string,data?:any}>
   postNewOfferServiceDetails(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
   updateOfferServiceDetails(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
   fetchManagerWalletService(managerId:string):Promise<{success:boolean,message:string,data:any}>
   fetchAllEventService(companyName:string):Promise<{success:boolean,message:string,data:any}>
   getSelectedOfferService(offerId:string):Promise<{success:boolean,message:string,data?:any}>
   createEventPostService(formData:EventData,file:Express.Multer.File):Promise<{success:boolean,message:string,data?:any}>
   createEventSeatService(formData:EventSeatDetails,eventId:string):Promise<{success:boolean,message:string,data?:any}>
   updateEventPostService(formData:EventData,fileNames:Express.Multer.File[],eventId:string):Promise<{success:boolean,message:string,data?:any}>
   getAllEventService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
   getSelectedEventService(id:string):Promise<{success:boolean,message:string,data?:any}>
   getSelectedEventTicketService(id:string):Promise<{success:boolean,message:string,data?:any}>
   getTodaysBookingService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
   getTotalBookingService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
   getBookedUserService(managerName:string):Promise<{success:boolean,message:string,data:any}>;
   createChatSchemaService(formData:FormData):Promise<{success:boolean,message:string,data:any}>;
   getAllVerifierService(managerName:string):Promise<{success:boolean,message:string,data:any}>;
   updateVerifierStatusService(verifierId:string):Promise<{success:boolean,message:string,data:any}>;
   postVerifierLoginService(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>;
   updateVerifierService(formData:verifierFormData):Promise<{success:boolean,message:string,data:any}>;
   fetchSelectedVerifierService(verifierId:string):Promise<{success:boolean,message:string,data:any}>;
   postSeatInformationService(ticket:TicketType):Promise<{success:boolean,message:string,data:any}>;
   fetchNotificationOfManager(managerId:string):Promise<{success:boolean,message:string,data:any}>;
   NotificationCountOfManager(managerId:string):Promise<{success:boolean,message:string,data:any}>;
   checkValidDate(eventName:string):Promise<{success:boolean,message:string,data:any}>;
   getUserCountAndRevenue(managerId:string):Promise<{success:boolean,message:string,data:any}>;
   getDashboardGraph(managerId:string,selectedType:string,selectedTime:string):Promise<{success:boolean,message:string,data:any}>;
   getDashboardPieChart(managerId:string):Promise<{success:boolean,message:string,data:any}>;
}
