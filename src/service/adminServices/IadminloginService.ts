import { FormData, OfferData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";

export interface IadminloginService{
    AdminloginDetails(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    Adminlogin(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    getUserDetailsService():Promise<{ success: boolean; message: string; user: any | null }>;
    getManagerDetailsService: () => Promise<| { success: boolean; message: string; user: any; } | undefined>;
    getManagerEventService(managerId:string):Promise<| { success: boolean; message: string; user: any; } | undefined>;
    postToggleIsBlockService(userId:string,updatedStatus:boolean):Promise<{result?:any}>
    postManagerIsBlockService(managerId:string,updatedStatus:boolean):Promise<{result?:any}>
    fetchAdminWalletService():Promise<{result?:any}>
    postCategoryIsBlockService(categoryId:string,updatedStatus:boolean):Promise<{result?:any}>
    getCategoryService(req:Request,res:Response):Promise<{result?:any}>
    fetchSelectedCategoryService(id:string,req:Request,res:Response):Promise<{result?:any}>
    editSelectedCategoryService(category:string,categoryId:string,req:Request,res:Response):Promise<{result?:any}>
    addCategoryService(formData:FormData,req:Request,res:Response):Promise<{result?:any}>
    getUserManagerDetailsService():Promise<{ success: boolean; message: string; user: any}>
    getDashboardGraph(selectedType:string,selectedTime:string):Promise<{ success: boolean; message: string; user: any}>
    getDashboardPieChart():Promise<{ success: boolean; message: string; data: any}>
    getDashboardBarChart(selectedEvent:string):Promise<{ success: boolean; message: string; data: any}>
    postNewOfferServiceDetails(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
    getAllOfferServiceDetails():Promise<{success:boolean,message:string,data?:any}>
     getSelectedOfferService(offerId:string):Promise<{success:boolean,message:string,data?:any}>
     updateOfferServiceDetails(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
     




}