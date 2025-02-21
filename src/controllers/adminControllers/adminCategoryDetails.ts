import { Request,Response } from "express";
import { AdminLoginServices } from "../../service/adminServices/adminloginService";
import { IadminloginService } from "../../service/adminServices/IadminloginService";
export class adminCategory{
    private adminService:IadminloginService;
    constructor(adminServiceInstance:IadminloginService){
        this.adminService=adminServiceInstance;
    }
    async getCategoryController(req:Request,res:Response){
        try {
            const result=await this.adminService.getCategoryService(req,res);
            return result;
            
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
        
    }

    async fetchSelectedCategoryController(categoryId:string,req:Request,res:Response){
        try {
            const result=await this.adminService.fetchSelectedCategoryService(categoryId,req,res);
            return result;
            
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }

    async editSelectedCategoryController(category:string,categoryId:string,req:Request,res:Response){
        try {
            const result=await this.adminService.editSelectedCategoryService(category,categoryId,req,res);
            return result;
            
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }
    async addEventCategoryController(formData:{[key:string]:string},req:Request,res:Response){

        try {
            const result=await this.adminService.addCategoryService(formData,req,res);
            return result;
            
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }

}