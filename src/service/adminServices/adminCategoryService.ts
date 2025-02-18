import { AdminLoginRepo } from "../../repository/AdminRepository/AloginRepo"
import { Request,Response} from "express-serve-static-core";
import { IAloginRepo } from "../../repository/AdminRepository/IAloginRepo";
export class adminCategoryService{
    private adminRepo:IAloginRepo;
    constructor(adminRepositoryInstance:IAloginRepo){
        this.adminRepo=adminRepositoryInstance;

    }
    async getCategoryDetailsService(req:Request,res:Response){
     
    
        try {
            // Call the repository method
            const result = await this.adminRepo.getCategoryRepo(req, res);
            return result;
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            return res
                .status(500)
                .json({ message: "Internal server error", error });
        }
      

    }
    async addCategoryDetailsService(formData:{[key:string]:string},req:Request,res:Response){
        
        if (!formData.categoryName.trim()) {
            return res.status(400).json({ message: "Category name is required." });
        }
    
        // Validate description
        if (!formData.description.trim()) {
            return res.status(400).json({ message: "Description is required." });
        }
    
        try {
            // Call the repository method
            const result = await this.adminRepo.addCategoryRepo(formData,req, res);
            return {result};
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            return res
                .status(500)
                .json({ message: "Internal server error", error });
        }
    }

}