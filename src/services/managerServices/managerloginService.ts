import GenerateOTP from "../../config/nodemailer.config";
import { IManagerLoginService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerLoginService";
import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { Request,Response } from "express";
import { IManagerLoginRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IManagerLoginRepo";
import { FormData } from "../../dtos/user.dto";
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  @injectable()
export class ManagerLoginService implements IManagerLoginService{
    constructor(
        @inject(TYPES.IManagerLoginRepo) private _managerLoginRepo:IManagerLoginRepo
    ){}
        async CheckingEmail(email: string){
        try {
          if (!email) {
            throw new Error('Email not provided');
          }
      
          const isPresent = await this._managerLoginRepo.isEmailPresentRepo(email);
      
          if (isPresent) {
            console.log('Email is already registered');
            return false;
          }
          console.log('Email is not registered');
          const otp = generateOTP();
          console.log('Generated OTP:', otp); 
          GenerateOTP(email,otp);
          return otp;
        } catch (error) {
          console.error(
            `Error in CheckingEmail service for email "${email}":`,
            error instanceof Error ? error.message : error
          );
          throw new Error('Error checking email');
        }
      }
            async managerVerifyService(formData: FormData, otp: string, globalOTP: string | number | null){
        try {
            if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
                // Await the result of postUser Data to ensure proper handling of the promise
                const result = await this._managerLoginRepo.postUserDataRepo(formData);
                return { success: true, message: 'Otp is matched successfully', user: result };
            } else {
              return { success: false, message: 'User is not  matched successfully', user: null };
            }
        } catch (error) {
            console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
            throw new Error('Error verifying OTP or saving user data');
        }
    }
    async managerLoginService(formData: FormData): Promise<{ success: boolean; message: string; user: any }> {
      try {
         
          if (formData.email && formData.password) {
              const result = await this._managerLoginRepo.checkManagerLoginRepo(formData);
              return { success: result.success, message: result.message, user: result.user };
          } else {

              return { success: false, message: 'Email and password are required', user: undefined };
          }
      } catch (error) {
          console.error(`Error in mloginDetails:`, error instanceof Error ? error.message : error);
          throw new Error('Error verifying login');
      }
  }

      async managerForgotEmail(email: string){
        try {
          if (!email) {
            throw new Error('Invalid email provided.');
          }
      
          const result = await this._managerLoginRepo.isManagerEmailValidRepo(email);
      
          if (result.success) {
            const otp = generateOTP();
            console.log('Generated OTP:', otp);
            const recipient = { email: 'nourinvn@gmail.com' };
            const { email } = recipient; 
        
            
            
            
            try {
              await GenerateOTP(email, otp);
            } catch (err) {
              console.error('Error sending OTP:', err);
              throw new Error('Failed to send OTP.');
            }
      
            return { success: true, message: 'OTP sent successfully', otpValue: otp };
          } else {
            return { success: result.success, message: result.message, otpValue: null };
          }
        } catch (error) {
          console.error(
            'Error in forgotEmailDetails:',
            error instanceof Error ? error.message : error
          );
          throw new Error('Error verifying email.');
        }
      }



      async verifyOtpForForgot(email: string, otp: string, globalOTP: string | number | null){
        try {
            if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
           
                return { success: true, message: 'OTP are matched'};
            } else {
            return {success:false,message:'OTP is not matched!'}
            }
        } catch (error) {
            console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
            throw new Error('Error verifying OTP or saving user data');
        }
    }


    async resetPasswordDetailsForManager(email:string,password:string,password1:string){
      try {
        console.log("menu",password,password1,email);
        
        if (email && password && password1) {
          console.log("bhai");
          
          const result = await this._managerLoginRepo.resetPasswordRepoForManagerRepo(email,password,password1);
          return { success: true, message: 'Reset Password SuccessFully', user: result };
        } else {
          throw new Error('Invalid login credentials.');
        }
      } catch (error) {
        console.error(
          `Error in loginDetails:`,
          error instanceof Error ? error.message : error
        );
        throw new Error('Error verifying login credentials');
      }
    }
      async getEventTypeDataService(req: Request): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const result = await this._managerLoginRepo.getEventTypeDataRepo(req); // Fetch data from the repository

        // Return success or failure with the appropriate message and data
        return { success: result.success, message: result.message, data: result.data };

    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Unexpected error occurred" };
    }
}
async getManagerProfileService(companyName:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this._managerLoginRepo.getManagerProfileRepo(companyName); // Fetch data from the repository

      // Return success or failure with the appropriate message and data
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}
async updateManagerProfileService(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this._managerLoginRepo.updateManagerProfileRepo(formData); // Fetch data from the repository

  
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}
async updateManagerPasswordService(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this._managerLoginRepo.updateManagerPasswordRepo(formData); // Fetch data from the repository

      // Return success or failure with the appropriate message and data
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}
async fetchNotificationOfManagerService(managerId:string){
  try {
    const savedEvent = await this._managerLoginRepo.fetchManagerNotificationRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }

}
async fetchAllEventService(companyName:string){
  const managerData = await this._managerLoginRepo.fetchAllCompanyEventRepo(companyName); 

  if (managerData.success) {
      return {
          success: managerData.success,
          message: managerData.message,
          data: managerData.data
      };
  } else {
      return {
          success: false,
          message: managerData.message,
          data: managerData.data
      };
  }

}
async getUserCountAndRevenueService(managerId:string){
  try {
    const savedEvent = await this._managerLoginRepo.fetchUserCountAndRevenueRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }
}
async getDashboardGraphService(managerId:string,selectedType:string,selectedTime:string){
  try {
    const savedEvent = await this._managerLoginRepo.fetchDashboardGraphRepo(managerId,selectedType,selectedTime);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }
}
async getDashboardPieChartService(managerId:string){
  try {
    const savedEvent = await this._managerLoginRepo.fetchDashboardPieChartRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }

}
async getDashboardBarChartService(selectedEvent:string){
    try {
    const savedEvent = await this._managerLoginRepo.fetchDashboardBarChartRepo(selectedEvent);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }
}
async NotificationCountOfManagerService(managerId:string){
  try {
    const savedEvent = await this._managerLoginRepo.fetchManagerNotificationCountRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}
async checkValidDate(eventName:string){
    try {
    const savedEvent = await this._managerLoginRepo.checkValidDateRepo(eventName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}
async fetchEventNameService(managerId:string){
      try {
    const savedEvent = await this._managerLoginRepo.fetchEventNamesRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}





    
}