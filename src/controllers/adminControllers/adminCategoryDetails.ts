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