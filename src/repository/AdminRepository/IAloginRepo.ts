import { FormData, OfferData } from "../../config/enum/dto";
import { Request,Response } from "express";

export interface IAloginRepo{
    postAdminData(formData: FormData,password: string): Promise<{ success: boolean; message: string; user: any }>;
    checkAdminLogin( formData: { [key: string]: string }): Promise<{ success: boolean; message: string; user: any }>;
      getUserDetailsRepository():Promise<{ success: boolean; message: string; user: any }>;
      getManagerDetailsRepository():Promise<{success:boolean,message:string,user:any}>
      getManagerUserCountRepository():Promise<{success:boolean,message:string,user:any}>
      fetchDashboardGraphRepo(selectedType:string,selectedTime:string):Promise<{success:boolean,message:string,user:any}>
      fetchDashboardPieChartRepo():Promise<{success:boolean,message:string,data:any}>
      fetchDashboardBarChartRepo(selectedEvent:string):Promise<{success:boolean,message:string,data:any}>
      getManagerAndBookedRepository(managerId:string):Promise<{success:boolean,message:string,user:any}>
      postToggleIsBlockRepository(userId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      postManagerIsBlockRepository(managerId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      fetchAdminWalletRepository():Promise<{success:boolean,message:string,user:any}>
      postCategoryIsBlockRepository(categoryId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      getCategoryRepo(req:Request,res:Response):Promise<{result?:any}>
      fetchSelectedCategoryRepo(categoryId:string,req:Request,res:Response):Promise<{result?:any}>
      editSelectedCategoryRepo(category:string,categoryId:string,req:Request,res:Response):Promise<{result?:any}>
      addCategoryRepo(formData:FormData,req:Request,res:Response):Promise<{result:any}>
      postOfferDetails(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
      getAllOfferDetails():Promise<{ success: boolean; message: string; data?: any }>
      getSelectedOfferRepo(offerId:string):Promise<{ success: boolean; message: string; data?: any }>
       updateOfferDetailsRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
}