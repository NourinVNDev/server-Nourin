import {AdminLoginRepo} from '../../repository/AdminRepository/AloginRepo';
import bcrypt  from 'bcrypt';
import { FormData } from '../../config/enum/dto';
import { IadminloginService } from './IadminloginService';
import { adminCategoryService } from './adminCategoryService';
import { IAloginRepo } from '../../repository/AdminRepository/IAloginRepo';
import { Request,Response } from 'express';
const hashPassword = async (password:string) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('Hashed Password:', hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
  };
export class  AdminLoginServices implements IadminloginService{
    private adminRepo:IAloginRepo;
    private adminCategory:adminCategoryService;
    constructor(adminRepositoryInstance:IAloginRepo){
        this.adminRepo=adminRepositoryInstance;
        this.adminCategory=new adminCategoryService(adminRepositoryInstance);
    }
    async AdminloginDetails(formData:FormData){
        try {
          if (formData.email !== null && formData.password !==null) {
            const hashPassword1= await hashPassword(formData.password);
              const result = await this.adminRepo.postAdminData(formData,hashPassword1);
              return { success: true, message: 'User  data saved successfully', user: result };
          } else {
            return { success: false, message: 'User data Not saved', user: {} };

          }
      } catch (error) {
          console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
          throw new Error('Error verifying OTP or saving user data');
      }
      }
      async Adminlogin(formData:FormData){
        try {
          if (formData.email !== null && formData.password !==null) {
              // Await the result of postUser Data to ensure proper handling of the promise
              const result = await this.adminRepo.checkAdminLogin(formData);
              return { success: true, message: 'User  data saved successfully', user: result };
          } else {
              throw new Error('Invalid OTP. Please try again.');
          }
      } catch (error) {
          console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
          throw new Error('Error verifying OTP or saving user data');
      }
      }   
      async getUserDetailsService() {
        try {
            const result = await this.adminRepo.getUserDetailsRepository();
            if (!result.success) {
                throw new Error(result.message); // Handle unsuccessful fetch
            }
            return result; // Return successful data
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }
    }

    async postToggleIsBlockService(userId: string, updatedStatus: boolean) {
        try {
            if (!userId || updatedStatus === null || updatedStatus === undefined) {
                throw new Error('Invalid parameters');
            }
    
            const result = await this.adminRepo.postToggleIsBlockRepository(userId, updatedStatus);
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }
    }
    

    async getManagerDetailsService(){
        try {
            const result=await this.adminRepo.getManagerDetailsRepository();
            if(!result.success){
                throw new Error(result.message);
            }
            return result;
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }
    }
    async getUserManagerDetailsService(){
        try {
            const result=await this.adminRepo.getManagerUserCountRepository();
            if(!result.success){
                throw new Error(result.message);
            }
            return result;
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }
    }
    async getDashboardGraph(selectedType:string,selectedTime:string){
        try {
            const savedEvent = await this.adminRepo.fetchDashboardGraphRepo(selectedType,selectedTime);
            return {success:savedEvent.success,message:savedEvent.message,user:savedEvent.user};
          } catch (error) {
            console.error("Error in fetching Manager Dashboard:", error);
            throw new Error("Failed to fetching Manager Dashboard"); 
          }
    }
    async getDashboardPieChart(){
        try {
            const savedEvent = await this.adminRepo.fetchDashboardPieChartRepo();
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          } catch (error) {
            console.error("Error in fetching Manager Dashboard:", error);
            throw new Error("Failed to fetching Manager Dashboard"); 
          }

    }
    async getManagerEventService(managerId:string){
        try {
            const result=await this.adminRepo.getManagerAndBookedRepository(managerId);
            if(!result.success){
                throw new Error(result.message);
            }
            return result;
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }

    }


    async postManagerIsBlockService(managerId: string, updatedStatus: boolean) {
        try {
            if (!managerId || updatedStatus === null || updatedStatus === undefined) {
                throw new Error('Invalid parameters');
            }
    
            const result = await this.adminRepo.postManagerIsBlockRepository(managerId, updatedStatus);
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }
    }
    async fetchAdminWalletService(){
        try {

    
            const result = await this.adminRepo.fetchAdminWalletRepository();
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }

    }
    async getCategoryService(req:Request,res:Response){
        try {
            const result=await this.adminCategory.getCategoryDetailsService(req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
        
    }

    async fetchSelectedCategoryService(categoryId:string,req:Request,res:Response){
        try {
            const result=await this.adminCategory.fetchSelectedCategoryService(categoryId,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }

    async editSelectedCategoryService(category:string,categoryId:string,req:Request,res:Response){
        try {
            const result=await this.adminCategory.editSelectedCategoryService(category,categoryId,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }
    
    async postCategoryIsBlockService(categoryId: string, updatedStatus: boolean) {
        try {
            if (!categoryId || updatedStatus === null || updatedStatus === undefined) {
                throw new Error('Invalid parameters');
            }
    
            const result = await this.adminRepo.postCategoryIsBlockRepository(categoryId, updatedStatus);
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }
    }


    async addCategoryService(formData:{[key:string]:string},req:Request,res:Response){
        try {
            const result=await this.adminCategory.addCategoryDetailsService(formData,req,res);
            return {result};
        }catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(500).json({ message: "Internal server error", error });
            return { result: undefined }; 
        }
    }
    
    }
