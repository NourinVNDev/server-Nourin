import { EventData, eventLocation, EventSeatDetails, FormData, OfferData, TicketType, verifierFormData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";
import { verifierDetailsService } from "../../service/verifierServices/verifierDetailsService";
export interface IMloginRepo{
    isEmailPresent(email:string):Promise<boolean>;
    postUserData(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    checkManagerLogin(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    isManagerEmailValid(email:string):Promise<{success:boolean,message:string,user:any}>;
    // resetPasswordDetailsForManager(formData:FormData,email:string):Promise<{success:boolean,message:string,user:any}>;
    resetPasswordRepoForManager(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user?:any}>;
    getManagerProfileRepo(companyName:string):Promise<{success:boolean,message:string,data?:any}>;
    updateManagerProfileRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
    updateManagerPasswordRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
    getEventTypeData(req:Request):Promise<{success:boolean,message:string,data?:any}>;
    getTodaysBookingRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>;
    getTotalBookingRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>;
    getUserDataRepo(managerName:string):Promise<{success:boolean,message:string,data:any}>;
    postEventRepository(formData:EventData,location:eventLocation|null,fileName:string):Promise<{ success: boolean; message: string|undefined; data?:any|undefined; }>
    postEventSeatRepository(formData:EventSeatDetails,eventId:string):Promise<{ success: boolean; message: string; data?:any; }>
    postUpdateEventRepository(formData:EventData,fileName:string[],eventId:string,location:eventLocation|null):Promise<{ success: boolean; message: string; data:any; }>
    getAllEventRepo(managerId:string):Promise<{ success: boolean; message: string; data?:any; }>
    getSelectedEventRepo(id:string):Promise<{ success: boolean; message: string; data?: any }>
    getSelectedEventTicketRepo(id:string):Promise<{ success: boolean; message: string; data?: any }>
    getAllOfferDetails(managerId:string):Promise<{ success: boolean; message: string; data?: any }>
    getSearchOfferInput(searchData:string):Promise<{ success: boolean; message: string; data?: any }>
    postOfferDetails(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
    updateOfferDetailsRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
    fetchManagerWalletRepo(managerId:string):Promise<{success:boolean,message:string,data:any}>
    fetchAllCompanyEventRepo(companyName:string):Promise<{success:boolean,message:string,data:any}>
    getSelectedOfferRepo(offerId:string):Promise<{ success: boolean; message: string; data?: any }>
    getAllVerifierRepo(managerName:string):Promise<{ success: boolean; message: string; data?: any }>
    updateVerifierStatusRepo(verifierId:string):Promise<{ success: boolean; message: string; data?: any }>
    postVerifierLoginRepo(formData:verifierFormData):Promise<{ success: boolean; message: string; data?: any }>
    updateVerifierRepo(formData:verifierFormData):Promise<{ success: boolean; message: string; data?: any }>
    fetchSelectedVerifierRepo(verifierId:string):Promise<{ success: boolean; message: string; data?: any }>
    updateSeatInformationRepo(ticketData:TicketType):Promise<{ success: boolean; message: string; data?: any }>
    createChatSchemaRepo(userId:string,manager:string):Promise<{success:boolean,message:string,data:any}>
    fetchManagerNotificationRepo(managerId:string):Promise<{success:boolean,message:string,data?:any|null}>
    fetchManagerNotificationCountRepo(managerId:string):Promise<{success:boolean,message:string,data?:any|null}>
    checkValidDateRepo(eventName:string):Promise<{success:boolean,message:string,data?:any|null}>
    fetchUserCountAndRevenueRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>
    fetchDashboardGraphRepo(managerId:string,selectedType:string,selectedTime:string):Promise<{success:boolean,message:string,data?:any}>
    fetchDashboardPieChartRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>
    
}