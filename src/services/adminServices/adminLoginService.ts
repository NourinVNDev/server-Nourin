import { FormData } from "../../dtos/user.dto";
import { IAdminLoginService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminLoginService";
import bcrypt  from 'bcrypt';
import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IAdminLoginRepo } from "../../interfaces/adminInterfaces/repositoryInterfaces/IAdminLoginRepo";
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
  @injectable()
export class AdminLoginService implements IAdminLoginService{
    constructor(
        @inject(TYPES.IAdminLoginRepo) private _adminLoginRepo:IAdminLoginRepo
    ){}
        async AdminloginDetails(formData:FormData){
        try {
          if (formData.email !== null && formData.password !==null) {
            const hashPassword1= await hashPassword(formData.password);
              const result = await this._adminLoginRepo.postAdminData(formData,hashPassword1);
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
              const result = await this._adminLoginRepo.checkAdminLogin(formData);
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
            const result = await this._adminLoginRepo.getUserDetailsRepository();
            if (!result.success) {
                throw new Error(result.message); // Handle unsuccessful fetch
            }
            return result; // Return successful data
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }
    }

        async getManagerDetailsService(){
        try {
            const result=await this._adminLoginRepo.getManagerDetailsRepository();
            if(!result.success){
                throw new Error(result.message);
            }
            return result;
        } catch (error) {
            console.error(`Error in getUserDetailsService:`, error instanceof Error ? error.message : error);
            throw new Error('Failed to fetch user details');
        }
    }
        async getManagerEventService(managerId:string){
        try {
            const result=await this._adminLoginRepo.getManagerAndBookedRepository(managerId);
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
    
            const result = await this._adminLoginRepo.postManagerIsBlockRepository(managerId, updatedStatus);
    
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

    
            const result = await this._adminLoginRepo.fetchAdminWalletRepository();
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }

    }
        async postToggleIsBlockService(userId: string, updatedStatus: boolean) {
        try {
            if (!userId || updatedStatus === null || updatedStatus === undefined) {
                throw new Error('Invalid parameters');
            }
    
            const result = await this._adminLoginRepo.postToggleIsBlockRepository(userId, updatedStatus);
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }
    }
        async getUserManagerDetailsService(){
        try {
            const result=await this._adminLoginRepo.getManagerUserCountRepository();
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
            const savedEvent = await this._adminLoginRepo.fetchDashboardGraphRepo(selectedType,selectedTime);
            return {success:savedEvent.success,message:savedEvent.message,user:savedEvent.user};
          } catch (error) {
            console.error("Error in fetching Manager Dashboard:", error);
            throw new Error("Failed to fetching Manager Dashboard"); 
          }
    }
    async getDashboardPieChart(){
        try {
            const savedEvent = await this._adminLoginRepo.fetchDashboardPieChartRepo();
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          } catch (error) {
            console.error("Error in fetching Manager Dashboard:", error);
            throw new Error("Failed to fetching Manager Dashboard"); 
          }

    }
    async getDashboardBarChart(selectedEvent:string){
           try {
            const savedEvent = await this._adminLoginRepo.fetchDashboardBarChartRepo(selectedEvent);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          } catch (error) {
            console.error("Error in fetching Manager Dashboard:", error);
            throw new Error("Failed to fetching Manager Dashboard"); 
          }
    }
            async postCategoryIsBlockService(categoryId: string, updatedStatus: boolean) {
        try {
            if (!categoryId || updatedStatus === null || updatedStatus === undefined) {
                throw new Error('Invalid parameters');
            }
    
            const result = await this._adminLoginRepo.postCategoryIsBlockRepository(categoryId, updatedStatus);
    
            if (!result.success) {
                throw new Error(result.message);
            }
    
            return {result};
        } catch (error) {
            console.error('Error in postToggleIsBlockService:', error instanceof Error ? error.message : error);
            throw new Error('Failed to toggle block status');
        }
    }






}