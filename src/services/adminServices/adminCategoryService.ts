import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IAdminCategoryRepo } from "../../interfaces/adminInterfaces/repositoryInterfaces/IAdminCategoryRepo";
import { IAdminCategoryService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminCategoryService";
import { Request,Response} from "express-serve-static-core";
@injectable()
export class AdminCategoryService implements IAdminCategoryService{
    constructor(
        @inject(TYPES.IAdminCategoryRepo) private _categoryRepo:IAdminCategoryRepo
    ){}
        async getCategoryService(req:Request,res:Response){
        try {
            const result=await this._categoryRepo.getCategoryRepo(req,res);
            return result;
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
        
    }
        async addCategoryService(formData:{[key:string]:string},req:Request,res:Response){
        try {
          if (!formData.categoryName.trim()) {
      return { result: null, error: "Category name is required." };
    }

    if (!formData.description.trim()) {
      return { result: null, error: "Description is required." };
    }

            const result=await this._categoryRepo.addCategoryRepo(formData,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }

        async fetchSelectedCategoryService(categoryId:string,req:Request,res:Response){
        try {
            const result=await this._categoryRepo.fetchSelectedCategoryRepo(categoryId,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }
      async editSelectedCategoryService(category:string,categoryId:string,req:Request,res:Response){
        try {
            const result=await this._categoryRepo.editSelectedCategoryRepo(category,categoryId,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }



}