import { EventData, EventSeatDetails, FormData, OfferData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";
export interface IMloginRepo{
    isEmailPresent(email:string):Promise<boolean>;
    postUserData(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    checkManagerLogin(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    isManagerEmailValid(email:string):Promise<{success:boolean,message:string,user:any}>;
    // resetPasswordDetailsForManager(formData:FormData,email:string):Promise<{success:boolean,message:string,user:any}>;
    resetPasswordRepoForManager(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user:any}>;
    getManagerProfileRepo(companyName:string):Promise<{success:boolean,message:string,data?:any}>;
    updateManagerProfileRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
    updateManagerPasswordRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
    getEventTypeData(req:Request):Promise<{success:boolean,message:string,data?:any}>;
    getTodaysBookingRepo():Promise<{success:boolean,message:string,data?:any}>;
    getTotalBookingRepo():Promise<{success:boolean,message:string,data?:any}>;
    getUserDataRepo(managerName:string):Promise<{success:boolean,message:string,data:any}>;
    postEventRepository(formData:EventData,fileName:string):Promise<{ success: boolean; message: string; data?:any; }>
    postEventSeatRepository(formData:EventSeatDetails,eventId:string):Promise<{ success: boolean; message: string; data?:any; }>
    postUpdateEventRepository(formData:EventData,fileName:string[],eventId:string):Promise<{ success: boolean; message: string; data?:any; }>
    getAllEventRepo(req:Request,res:Response):Promise<{ success: boolean; message: string; data?:any; }>
    getSelectedEventRepo(id:string):Promise<{ success: boolean; message: string; data?: any }>
    getAllOfferDetails(req:Request,res:Response):Promise<{ success: boolean; message: string; data?: any }>
    getSearchOfferInput(searchData:string):Promise<{ success: boolean; message: string; data?: any }>
    postOfferDetails(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
    updateOfferDetailsRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
    getSelectedOfferRepo(offerId:string):Promise<{ success: boolean; message: string; data?: any }>
    createChatSchemaRepo(userId:string,manager:string):Promise<{success:boolean,message:string,data:any}>
}