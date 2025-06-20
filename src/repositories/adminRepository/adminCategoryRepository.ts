import { IAdminCategoryRepo } from "../../interfaces/adminInterfaces/repositoryInterfaces/IAdminCategoryRepo";
import { Request,Response} from "express-serve-static-core";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
export class AdminCategoryRepository implements IAdminCategoryRepo{
      async getCategoryRepo(req: Request, res: Response): Promise<{ result?: any }> {
        try {
            const result = await CATEGORYDB.find();
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }
       async addCategoryRepo(formData:{[key:string]:string},req:Request,res:Response){
        try {
          
            console.log("Category Repo",formData.categoryName)

             const isCategoryNamePresent = await CATEGORYDB.findOne({ categoryName: formData.categoryName });
            // Create a new category entry
            if (isCategoryNamePresent) {
                console.log("Maad");
                
                return { success: false, message: "Category Name is already Present",result:null };
            }
            const result = await CATEGORYDB.create({
                categoryName: formData.categoryName,
                Description: formData.description, // Ensure proper casing
            });
            return {success:true,message:'SuccessFully adding Category',result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return {success:false,message:'',result:undefined}
        }
      }
          async fetchSelectedCategoryRepo(categoryId:string,req:Request,res:Response){
        try {
    const result = await CATEGORYDB.findById(categoryId);
      
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }

        async editSelectedCategoryRepo(category:string,categoryId:string,req:Request,res:Response){
        try {
        const result = await CATEGORYDB.findById(categoryId);
    
            if (!result) {
                throw new Error("Category not found");
            }
    
            result.Description = category;
            await result.save();
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }
    }


