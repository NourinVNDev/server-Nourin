import { FormData } from "../../config/enum/dto";
import { Request,Response } from "express-serve-static-core";

export interface IadminloginService{
    AdminloginDetails(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    Adminlogin(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    getUserDetailsService():Promise<{ success: boolean; message: string; user: any | null }>;
    getManagerDetailsService: () => Promise<| { success: boolean; message: string; user: any; } | undefined>;
    postToggleIsBlockService(userId:string,updatedStatus:boolean):Promise<{result?:any}>
    postManagerIsBlockService(managerId:string,updatedStatus:boolean):Promise<{result?:any}>
    postCategoryIsBlockService(categoryId:string,updatedStatus:boolean):Promise<{result?:any}>
    getCategoryService(req:Request,res:Response):Promise<{result?:any}>
    addCategoryService(formData:FormData,req:Request,res:Response):Promise<{result?:any}>




}