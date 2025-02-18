import { FormData } from "../../config/enum/dto";
import { Request,Response } from "express";

export interface IAloginRepo{
    postAdminData(formData: FormData,password: string): Promise<{ success: boolean; message: string; user: any }>;
    checkAdminLogin( formData: { [key: string]: string }): Promise<{ success: boolean; message: string; user: any }>;
      getUserDetailsRepository():Promise<{ success: boolean; message: string; user: any }>;
      getManagerDetailsRepository():Promise<{success:boolean,message:string,user:any}>
      postToggleIsBlockRepository(userId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      postManagerIsBlockRepository(managerId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      postCategoryIsBlockRepository(categoryId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>
      getCategoryRepo(req:Request,res:Response):Promise<{result?:any}>
      addCategoryRepo(formData:FormData,req:Request,res:Response):Promise<{result:any}>






}