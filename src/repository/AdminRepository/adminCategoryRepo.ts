import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import { Request,Response } from 'express';
export class adminCategoryRepository{
    async getCategoryDetailsRepo(req:Request,res:Response){
        try {
            const result = await CATEGORYDB.find();
            return result;
            

        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
        

    }

    async fetchSelectedCategoryRepo(categoryId:string,req:Request,res:Response){
        try {
            const result = await CATEGORYDB.findById(categoryId);
            return result;
            

        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }
    async editSelectedCategoryRepo(category: string, categoryId: string,req:Request,res:Response): Promise<any> {
        try {
            const result = await CATEGORYDB.findById(categoryId);
    
            if (!result) {
                throw new Error("Category not found");
            }
    
            result.Description = category;
            await result.save();
            return result;
        } catch (error) {
            console.error("Error in editSelectedCategoryRepo:", error);
            throw error; // Let the controller handle the response
        }
    }
    

    async adminCategoryDetailsRepo(formData:{[key:string]:string},req:Request,res:Response){
        try {
            console.log("Category Repo",formData.categoryName)

             const isCategoryNamePresent = await CATEGORYDB.findOne({ categoryName: formData.categoryName });
            // Create a new category entry
            if (isCategoryNamePresent) {
                console.log("Maad");
                
                return { success: false, message: "Category Name is already Present" };
            }
            const result = await CATEGORYDB.create({
                categoryName: formData.categoryName,
                Description: formData.description, // Ensure proper casing
            });
            console.log("From Repo",result);    
    
            // Return the created result
            return { success: true, data: result };
        } catch (error) {
            console.error("Error in adminCategoryDetailsRepo:", error);
    
            // Send an appropriate error response
            res.status(500).json({
                message: "Internal server error while adding category",
                error,
            });
    }
}
}