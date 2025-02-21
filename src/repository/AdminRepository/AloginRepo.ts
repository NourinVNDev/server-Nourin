import ADMINDB from '../../models/adminModels/adminSchema';
import bcrypt  from 'bcrypt';
import { IAloginRepo } from './IAloginRepo';
import { FormData } from '../../config/enum/dto';
import USERDB from '../../models/userModels/userSchema';
import MANAGERDB from '../../models/managerModels/managerSchema';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import { adminCategoryRepository } from './adminCategoryRepo';
import { Request,Response } from 'express-serve-static-core';
export class AdminLoginRepo  implements IAloginRepo{
    private adminCategoryRepo:adminCategoryRepository;
    constructor(){
        this.adminCategoryRepo=new adminCategoryRepository();
    }
    async postAdminData(formData:FormData,password:string){
        try{   
        const newUser  = new ADMINDB({
       
            email: formData.email,
            password: password,
          
        });
        const savedUser  = await newUser .save();
    
        // You can return the saved user or a success message
        console.log('User  saved successfully:', savedUser );
        return { success: true, message: 'User  created successfully', user: savedUser  };
    } catch (error) {
        console.error("Error saving user data:", error);
        throw new Error('Failed to save user data');
    }
    }
    async checkAdminLogin(formData:FormData) {
        const plainPassword = formData.password;
        const user = await ADMINDB.findOne({ email: formData.email });
      
        if (!user) {
            console.log('User not found.');
            return {
                success: false,
                message: 'User not found.',
                user: null,
            };
        }
      
        const hashedPassword = user.password;
      
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            if (isMatch) {
                console.log('Password matches!');
                return {
                    success: true,
                    message: 'Login successful.',
                    user,
                };
            } else {
                console.log('Password does not match.');
                return {
                    success: false,
                    message: 'Invalid credentials.',
                    user: null,
                };
            }
        } catch (error) {
            console.error('Error comparing password:', error);
            return {
                success: false,
                message: 'An error occurred during  Admin login.',
                user: null,
            };
        }
      }
      async getUserDetailsRepository() {
        try {
            const result = await USERDB.find();
            return {
                success: true,
                message: 'Data fetched successfully',
                user: result,
            };
        } catch (error) {
            console.error('Error fetching user details from database:', error);
            return {
                success: false,
                message: 'An error occurred while fetching user details',
                user: null,
            };
        }
    }
    async postToggleIsBlockRepository(userId: string, updatedStatus: boolean) {
        try {
            const userData = await USERDB.findById(userId);
    
            if (!userData) {
                return {
                    success: false,
                    message: `User with ID ${userId} not found`,
                    user: null,
                };
            }
    
            userData.isBlock = updatedStatus;
            await userData.save();
    
            return {
                success: true,
                message: 'User block status updated successfully',
                user: userData,
            };
        } catch (error) {
            console.error('Error updating user block status in database:', error);
            return {
                success: false,
                message: 'An error occurred while updating block status',
                user: null,
            };
        }
    }
    

    async getManagerDetailsRepository(){
        try {
            const result=await MANAGERDB.find();
            return{success:true,message:'Manager Data fetched',user:result
            }
            
        } catch (error) {
            console.error('Error fetching user details from database:', error);
            return {
                success: false,
                message: 'An error occurred while fetching user details',
                user: null,
            };
            
        }
    }

    async postManagerIsBlockRepository(managerId: string, updatedStatus: boolean) {
        try {
            const managerData = await MANAGERDB.findById(managerId);
    
            if (!managerData) {
                return {
                    success: false,
                    message: `User with ID ${managerId} not found`,
                    user: null,
                };
            }
    
            managerData.isBlock = updatedStatus;
            await managerData.save();
    
            return {
                success: true,
                message: 'User block status updated successfully',
                user: managerData,
            };
        } catch (error) {
            console.error('Error updating user block status in database:', error);
            return {
                success: false,
                message: 'An error occurred while updating block status',
                user: null,
            };
        }
    }
    async getCategoryRepo(req: Request, res: Response): Promise<{ result?: any }> {
        try {
            const result = await this.adminCategoryRepo.getCategoryDetailsRepo(req, res);
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }

    async fetchSelectedCategoryRepo(categoryId:string,req:Request,res:Response){
        try {
            const result = await this.adminCategoryRepo.fetchSelectedCategoryRepo(categoryId,req,res);
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }


    async editSelectedCategoryRepo(category:string,categoryId:string,req:Request,res:Response){
        try {
            const result = await this.adminCategoryRepo.editSelectedCategoryRepo(category,categoryId,req,res);
            return { result };
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; // Ensure a valid return type
        }
    }
    


    async postCategoryIsBlockRepository(categoryId: string, updatedStatus: boolean) {
        try {
            const categoryData = await CATEGORYDB.findById(categoryId);
    
            if (!categoryData) {
                return {
                    success: false,
                    message: `User with ID ${categoryId} not found`,
                    user: null,
                };
            }
    
            categoryData.isListed = updatedStatus;
            await categoryData.save();
    
            return {
                success: true,
                message: 'User block status updated successfully',
                user: categoryData,
            };
        } catch (error) {
            console.error('Error updating user block status in database:', error);
            return {
                success: false,
                message: 'An error occurred while updating block status',
                user: null,
            };
        }
    }
    async addCategoryRepo(formData:{[key:string]:string},req:Request,res:Response){
        try {
            const result=await this.adminCategoryRepo.adminCategoryDetailsRepo(formData,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return {result:undefined}
        }
    }
}
