import {mLoginRepo} from '../../repository/managerRepository/MloginRepo';
import { IMloginService } from './IMloginService';
import { EventData, OfferData } from '../../config/enum/dto';
import GenerateOTP from '../../config/nodemailer';
import { FormData ,FormData1} from '../../config/enum/dto';

import { managerEventService } from './managerEventService';
import { uploadToCloudinary } from '../../config/cloudinaryConfig';
import { Request,Response}from'express';
import { managerOfferService } from './managerOfferService';
import { managerBookingService } from './managerBookingService';
import { IMloginRepo } from '../../repository/managerRepository/IMloginRepo';
import fs from 'fs';
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

export class mLoginService implements IMloginService{
  private managerService:IMloginRepo;
  private managerEventservice:managerEventService;
  private managerOfferService:managerOfferService
  private managerBookingService:managerBookingService;
  constructor(managerRepositoryIntance:IMloginRepo){
    this.managerService=managerRepositoryIntance;
    this.managerEventservice=new managerEventService(managerRepositoryIntance);
    this.managerOfferService=new managerOfferService(managerRepositoryIntance);
    this.managerBookingService=new managerBookingService(managerRepositoryIntance);
  }
    async CheckingEmail(email: string){
        try {
          if (!email) {
            throw new Error('Email not provided');
          }
      
          const isPresent = await this.managerService.isEmailPresent(email);
      
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
      async MverifyService(formData: FormData, otp: string, globalOTP: string | number | null){
        try {
            if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
                // Await the result of postUser Data to ensure proper handling of the promise
                const result = await this.managerService.postUserData(formData);
                return { success: true, message: 'Otp is matched successfully', user: result };
            } else {
              return { success: false, message: 'User is not  matched successfully', user: null };
            }
        } catch (error) {
            console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
            throw new Error('Error verifying OTP or saving user data');
        }
    }
    async mloginDetails(formData:FormData){
        try {
          if (formData.email !== null && formData.password !==null) {
              // Await the result of postUser Data to ensure proper handling of the promise
              const result = await this.managerService.checkManagerLogin(formData);
              return { success: true, message: 'User  data saved successfully', user: result };
          } else {
              throw new Error('Invalid OTP. Please try again.');
          }
      } catch (error) {
          console.error(`Error in verifyService:`, error instanceof Error ? error.message : error);
          throw new Error('Error verifying OTP or saving user data');
      }
      }

      async managerForgotEmail(email: string){
        try {
          if (!email) {
            throw new Error('Invalid email provided.');
          }
      
          const result = await this.managerService.isManagerEmailValid(email);
      
          if (result) {
            const otp = generateOTP();
            console.log('Generated OTP:', otp);
            const recipient = { email: 'nourinvn@gmail.com' };
            const { email } = recipient; 
            console.log(email);
            
            
            
            try {
              await GenerateOTP(email, otp);
            } catch (err) {
              console.error('Error sending OTP:', err);
              throw new Error('Failed to send OTP.');
            }
      
            return { success: true, message: 'OTP sent successfully', otpValue: otp };
          } else {
            return { success: false, message: 'Email not found', otpValue: null };
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
                throw new Error('Invalid OTP. Please try again.');
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
          
          const result = await this.managerService.resetPasswordRepoForManager(email,password,password1);
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
    
    async createEventPostService(formData: EventData, file: Express.Multer.File): Promise<{ success: boolean; message: string; data?: any }> {
      try {
          console.log("Validating and processing event data...");
  
          // Validate event name
          if (!formData.eventName) {
              return { success: false, message: "Event name is required." };
          }
  
          console.log("Checking files", file);
  
          // Upload file to Cloudinary
          const fileName = await uploadToCloudinary(file);
          console.log("Uploaded file name", fileName);
  
          // Use another service for extended logic
          const isAllowed = await this.managerEventservice.createEventPostService(formData, fileName as string);
          
          if (!isAllowed.success) {
              return { success: false, message: "Event validation failed in another service." };
          }
  
          return { success: true, message: "Event created successfully", data: isAllowed.data };
      } catch (error) {
          console.error("Error in createEventPostService:", error);
          return { success: false, message: "Failed to process event data in service layer." };
      }
  }

  async updateEventPostService(formData: EventData,fileNames: Express.Multer.File[],eventId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        console.log("Validating and processing event data...");

        // Upload files to Cloudinary
        const uploadedFileUrls = await Promise.all(
            fileNames.map(async (file) => {
                console.log('Files', file);
                return await uploadToCloudinary(file); // Upload directly using the Multer file
            })
        );

        console.log("Uploaded file URLs:", uploadedFileUrls);

        // Use another service for extended logic
        const isAllowed = await this.managerEventservice.updateEventPostService(
            formData,
            uploadedFileUrls as string[], // Assuming Cloudinary returns string URLs
            eventId
        );

        if (!isAllowed.success) {
            return { success: false, message: "Event validation failed in another service." };
        }

        return { success: true, message: "Event updated successfully", data: isAllowed.data };
    } catch (error) {
        console.error("Error in updateEventPostService:", error);
        return { success: false, message: "Failed to process event data in service layer." };
    }
}

  async getSearchOfferInput(searchData:string):Promise<{success: boolean; message: string; data?: any }>{
    try {
        const savedEvent =await this.managerOfferService.getSearchOfferService(searchData); 
        console.log("Saved Data",savedEvent);
        if(savedEvent){
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
        }else{
            return { success: false, message: "Not Found Offer Details data " };
        }
    
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer."); 
    }

}

async getManagerProfileService(companyName:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this.managerService.getManagerProfileRepo(companyName); // Fetch data from the repository

      // Return success or failure with the appropriate message and data
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}


async updateManagerProfileService(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this.managerService.updateManagerProfileRepo(formData); // Fetch data from the repository

      // Return success or failure with the appropriate message and data
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}

async updateManagerPasswordService(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
      const result = await this.managerService.updateManagerPasswordRepo(formData); // Fetch data from the repository

      // Return success or failure with the appropriate message and data
      return { success: result.success, message: result.message, data: result.data };

  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Unexpected error occurred" };
  }
}
  async getEventTypeDataService(req: Request): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const result = await this.managerService.getEventTypeData(req); // Fetch data from the repository

        // Return success or failure with the appropriate message and data
        return { success: result.success, message: result.message, data: result.data };

    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Unexpected error occurred" };
    }
}


async getAllOfferServiceDetails(
  req: Request,
  res: Response
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    const result = await this.managerOfferService.getOfferService(req, res);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}


async postNewOfferServiceDetails(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    console.log('checking the formData',formData)
    const result = await this.managerOfferService.postOfferService(formData);
    console.log("from service", result);
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in postNewOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer.");
  }
}
async updateOfferServiceDetails(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    console.log('checking the formData',formData)
    const result = await this.managerOfferService.updateOfferService(formData);
    console.log("from service", result);
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in postNewOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer.");
  }
}









async getAllEventService(
  req: Request,
  res: Response
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    const result = await this.managerEventservice.getAllEventDetailsService(req, res);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}


async getSelectedEventService(
id:string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    const result = await this.managerEventservice.getSelectedEventService2(id);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getSelectedOfferService(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Fetch data from the repository
      const result = await this.managerOfferService.getSelectedOfferService2(offerId);
      console.log("from service", result);
       return { success: result.success, message: result. message, data: result.data };
  
    } catch (error) {
      // Log and return a generic error response
      console.error("Error in getAllOfferServiceDetails:", error);
      throw new Error("Failed to create event in another service layer."); 
    }
  }


  async getTodaysBookingService():Promise<{ success: boolean; message: string; data?: any }>{
    try {
      // Fetch data from the repository
      const result = await this.managerBookingService.getTodaysBookingDetails2();
      console.log("from service", result);
       return { success: result.success, message: result. message, data: result.data };
  
    } catch (error) {
      // Log and return a generic error response
      console.error("Error in getAllOfferServiceDetails:", error);
      throw new Error("Failed to create event in another service layer."); 
    }
} 
async getTotalBookingService():Promise<{ success: boolean; message: string; data?: any }>{
  try {
    // Fetch data from the repository
    const result = await this.managerBookingService.getTotalBookingDetails2();
    console.log("from total booking", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}  



}



  


    
