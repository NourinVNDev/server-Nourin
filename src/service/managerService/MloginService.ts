import {mLoginRepo} from '../../repository/managerRepository/MloginRepo';
import { IMloginService } from './IMloginService';
import { EventData, EventSeatDetails, OfferData, TicketType, verifierFormData } from '../../config/enum/dto';
import GenerateOTP from '../../config/nodemailer';
import { FormData } from '../../config/enum/dto';

import { managerEventService } from './managerEventService';
import { uploadToCloudinary } from '../../config/cloudinaryConfig';
import { Request,Response}from'express';
import { managerOfferService } from './managerOfferService';
import { managerBookingService } from './managerBookingService';
import { IMloginRepo } from '../../repository/managerRepository/IMloginRepo';
import { managerVerifierService } from './managerVerifierService';
import { getCoordinates } from '../../config/getCoordinates';
import { eventLocation } from '../../config/enum/dto';
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

export class mLoginService implements IMloginService{
  private managerService:IMloginRepo;
  private managerEventservice:managerEventService;
  private managerOfferService:managerOfferService
  private managerBookingService:managerBookingService;
  private managerVerifierService:managerVerifierService
  constructor(managerRepositoryInstance:IMloginRepo){
    this.managerService=managerRepositoryInstance;
    this.managerEventservice=new managerEventService(managerRepositoryInstance);
    this.managerOfferService=new managerOfferService(managerRepositoryInstance);
    this.managerBookingService=new managerBookingService(managerRepositoryInstance);
    this.managerVerifierService=new managerVerifierService(managerRepositoryInstance);
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
    async mloginDetails(formData: FormData): Promise<{ success: boolean; message: string; user: any }> {
      try {
         
          if (formData.email && formData.password) {
              const result = await this.managerService.checkManagerLogin(formData);
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
      
          const result = await this.managerService.isManagerEmailValid(email);
      
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
          if (!formData.eventName) {
              return { success: false, message: "Event name is required." };
          }
  
          console.log("Checking files", file);
          const fileName = await uploadToCloudinary(file);
          console.log("Uploaded file name", fileName);
          let location:eventLocation|null=null;
          if(formData.title!='Virtual' && formData.address!=null){
            location=await getCoordinates(formData.address);
            console.log("Location",location);
          }else{
            location=null
          }
   

    
          const isAllowed = await this.managerEventservice.createEventPostService(formData,location, fileName as string);
          
          if (!isAllowed.success) {
              return { success: false, message: "Event validation failed in another service." };
          }
  
          return { success: true, message: "Event created successfully", data: isAllowed.data };
      } catch (error) {
          console.error("Error in createEventPostService:", error);
          return { success: false, message: "Failed to process event data in service layer." };
      }
  }


  async createEventSeatService(formData:EventSeatDetails,eventId:string):Promise<{ success: boolean; message: string; data?: any }>{
    try {
    
      console.log("EventID from Service:",eventId,formData);
      
      if (!eventId) {
          return { success: false, message: "EventId is not Found." };
      }

  



      // Use another service for extended logic
      const isAllowed = await this.managerEventservice.createEventSeatService(formData,eventId);
      
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
        let location:eventLocation|null=null;
        if(formData.title!='Virtual' && formData.address!=null){
          location=await getCoordinates(formData.address);
        }
      
   

        // Use another service for extended logic
        const isAllowed = await this.managerEventservice.updateEventPostService(
            formData,
            uploadedFileUrls as string[], // Assuming Cloudinary returns string URLs
            eventId,location
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
managerId:string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Fetch data from the repository
    const result = await this.managerOfferService.getOfferService(managerId);
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

    console.log('checking the formData',formData);
    const result = await this.managerOfferService.postOfferService(formData);
    console.log("from service", result);
    return { success: result.success, message: result.message, data: result.data };
  } catch (error) {
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

async fetchManagerWalletService(managerId:string){
    try {
      const savedEvent = await this.managerOfferService.fetchManagerWalletService2(managerId);
      return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    } catch (error) {
      console.error("Error in cancelling the booked Event:", error);
      throw new Error("Failed to cancell the booked Event"); 
    }

}
async fetchAllEventService(companyName:string){
  const managerData = await this.managerService.fetchAllCompanyEventRepo(companyName); 

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









async getAllEventService(managerId:string) {
  try {
    const result = await this.managerEventservice.getAllEventDetailsService(managerId);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
 
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}


async getSelectedEventService(
id:string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const result = await this.managerEventservice.getSelectedEventService2(id);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getSelectedEventTicketService(id:string){
  try {

    const result = await this.managerEventservice.getSelectedEventTicketService2(id);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {

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


  async getTodaysBookingService(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
    try {
      // Fetch data from the repository
      const result = await this.managerBookingService.getTodaysBookingDetails2(managerId);
      console.log("from service", result);
       return { success: result.success, message: result. message, data: result.data };
  
    } catch (error) {
      // Log and return a generic error response
      console.error("Error in getAllOfferServiceDetails:", error);
      throw new Error("Failed to create event in another service layer."); 
    }
} 
async getTotalBookingService(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {
    // Fetch data from the repository
    const result = await this.managerBookingService.getTotalBookingDetails2(managerId);
    console.log("from total booking", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
} 

 async getBookedUserService(managerName: string){
  try {
 
    const savedEvent = await this.managerBookingService.getBookedUserService2(managerName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getAllVerifierService(managerName:string){
  try {
 
    const savedEvent = await this.managerVerifierService.getAllVerifierService2(managerName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllVerifierServiceDetails:", error);
    throw new Error("Failed to get All Verifier Details."); 
  }

}

async updateVerifierStatusService(verifierId:string){
  try {
 
    const savedEvent = await this.managerVerifierService.updateVerifierStatusService2(verifierId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    
    console.error("Error in getAllVerifierServiceDetails:", error);
    throw new Error("Failed to get All Verifier Details."); 
  }

}

   async fetchSelectedVerifierService(verifierId:string){
    const verifierData = await this.managerVerifierService.fetchSelectedVerifierService2(verifierId); 

    if (verifierData.success) {
        return {
            success: verifierData.success,
            message: verifierData.message,
            data: verifierData.data
        };
    } else {
        return {
            success: false,
            message: verifierData.message,
            data: verifierData.data
        };
    }

   }
async postVerifierLoginService(formData:verifierFormData){
  const verifierData = await this.managerVerifierService.postVerifierLoginService2(formData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }

}
async updateVerifierService(formData:verifierFormData){
  const verifierData = await this.managerVerifierService.updateVerifierService2(formData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }
}
async postSeatInformationService(ticketData:TicketType){
  const verifierData = await this.managerEventservice.postTicketInformationService2(ticketData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }
}
async fetchNotificationOfManager(managerId:string){
  try {
    const savedEvent = await this.managerService.fetchManagerNotificationRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }

}
async NotificationCountOfManager(managerId:string){
  try {
    const savedEvent = await this.managerService.fetchManagerNotificationCountRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}
async getUserCountAndRevenue(managerId:string){
  try {
    const savedEvent = await this.managerService.fetchUserCountAndRevenueRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }
}
async getDashboardGraph(managerId:string,selectedType:string,selectedTime:string){
  try {
    const savedEvent = await this.managerService.fetchDashboardGraphRepo(managerId,selectedType,selectedTime);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }
}
async getDashboardPieChart(managerId:string){
  try {
    const savedEvent = await this.managerService.fetchDashboardPieChartRepo(managerId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Manager Dashboard:", error);
    throw new Error("Failed to fetching Manager Dashboard"); 
  }

}


async createChatSchemaService(formData:FormData){
  try {
    const {sender,receiver}=formData;
    if(!sender){
      return {success:false,message:'Manager is not Found',data:null};
    }
    if(!receiver){
      return {success:false,message:'User is not Found',data:null};
    }
    // Fetch data from the repository
    const savedEvent = await this.managerBookingService.createChatSchemaService2(sender,receiver);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

  

}
}



  


    
