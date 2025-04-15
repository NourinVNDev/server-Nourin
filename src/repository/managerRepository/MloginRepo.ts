import MANAGERDB from '../../models/managerModels/managerSchema';
import { IMloginRepo } from './IMloginRepo';
import { EventData, eventLocation, EventSeatDetails, OfferData, TicketType, verifierFormData } from '../../config/enum/dto';
import { managerEventRepository } from './mEventRepo';
import { Request,Response } from 'express';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import OFFERDB from '../../models/managerModels/offerSchema';
import { managerOfferRepository } from './mOfferRepo';
import { managerBookingRepository } from './mBookingUserRepo';
import { managerVerifierRepository } from './mVerifierRepo';
import NOTIFICATIONDB from '../../models/userModels/notificationSchema';

interface User {
    email: string;
    password: string; // Password is of type string
  }

import bcrypt  from 'bcrypt';
import SOCIALEVENTDB from '../../models/managerModels/socialEventSchema';

const hashPassword = async (password:string) => {
  try {
  
      const salt = await bcrypt.genSalt(10); 
      console.log("Sa;t",salt);
   console.log( await bcrypt.hash(password,salt));
   
      const hashedPassword = await bcrypt.hash(password,salt);
      
      console.log('Hashed Password:', hashedPassword);
      return hashedPassword;
  } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
  }
};
export class mLoginRepo implements IMloginRepo{
  private managerEventRepository:managerEventRepository;
  private managerOfferRepository:managerOfferRepository;
  private managerBookingRepository:managerBookingRepository;
  private managerVerifierRepository:managerVerifierRepository
  constructor(){
    this.managerEventRepository=new managerEventRepository();
    this.managerOfferRepository=new managerOfferRepository();
    this.managerBookingRepository=new managerBookingRepository();
    this.managerVerifierRepository=new managerVerifierRepository();
  }
    async isEmailPresent(email: string){
        try {
          const user = await MANAGERDB.findOne({ email });
          return !!user;
        } catch (error) {
          console.error('Error checking email in database:', error);
          throw new Error('Database query failed');
        }
      }
      async postUserData(formData:{ [key: string]: string }){
        try{
            console.log("sneha",formData);
           const hashPassword1= await hashPassword(formData.password);
            
        const newUser  = new MANAGERDB({
            firmName: formData.firmName,
            email: formData.email,
            experience:formData.experience,
            password: hashPassword1,
            phoneNo:formData.phoneNo
          
        });
    
        // Save the user to the database
        const savedUser  = await newUser .save();
    
        // You can return the saved user or a success message
        console.log('User  saved successfully:', savedUser );
        return { success: true, message: 'User  created successfully', user: savedUser  };
    } catch (error) {
        console.error("Error saving user data:", error);
        throw new Error('Failed to save user data');
    }
    }
    async checkManagerLogin(formData: { [key: string]: string }){
        const plainPassword = formData.password;
        const user = await MANAGERDB.findOne({ email: formData.email });
      
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
            const isMatch = await bcrypt.compare(plainPassword,hashedPassword);
            if (isMatch) {
                console.log('Password matches!');
                return {
                    success: true,
                    message: 'Login successful.',
                    user:user,
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
                message: 'An error occurred during login.',
                user: null,
            };
        }
      }
      
      async isManagerEmailValid(email:string){
        try {
          // Check if user exists in the database
          const user:User|null = await MANAGERDB.findOne({email });
      
          if (!user) {
            console.log('Manager not found.');
            return {
              success: false,
              message: 'Manager not found.',
              user: null,
            };
          }
          return {
            success: true,
            message: 'Found successful.',
            user,
          };
          
        } catch (error) {
          console.error('Error during login:', error);
          return {
            success: false,
            message: 'An error occurred during login.',
            user: null,
          };
        }
      }
      async resetPasswordRepoForManager(email: string, password: string, password1: string) {
        const confirmPassword = password1;
    
        // Validate input
        console.log("Last checking", password, confirmPassword, email);
    
        if (!email || !password || !confirmPassword) {
            console.log('Email, password, or confirm password is missing.');
            return {
                success: false,
                message: 'Email, password, and confirm password are required.',
                user: null,
            };
        }
    
        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format.');
            return {
                success: false,
                message: 'Invalid email format.',
                user: null,
            };
        }
    
        if (password !== confirmPassword) {
            console.log('Passwords do not match.');
            return {
                success: false,
                message: 'Passwords do not match.',
                user: null,
            };
        }
    
        try {
            console.log('Checking email:', email);
            // Check if the user exists
            const user = await MANAGERDB.findOne({ email });
            console.log('User ', user);
    
            if (!user) {
                console.log('User  not found.');
                return {
                    success: false,
                    message: 'User  not found.',
                    user: null,
                };
            }
    
            // Hash the new password
            const hashedPassword = await hashPassword(password);
            user.password = hashedPassword;
    
            await user.save();
    
            console.log('Password reset successful.');
            return {
                success: true,
                message: 'Password reset successful.',
             user:user
            };
        } catch (error) {
            console.error('Error during password reset:', error);
            return {
                success: false,
                message: 'An error occurred during password reset.',
                user:{},
            };
        }
    }
      async postEventRepository(formData: EventData,location:eventLocation, fileName: string) {
        try {
            console.log("Delegating event data to the actual repository...");
            
            const savedEvent = await this.managerEventRepository.createEventData(formData,location,fileName);
            
            return {
                success: savedEvent.success,
                data: savedEvent.data,
                message: savedEvent.message
            };
        } catch (error) {
            console.error("Error in postEventRepository:", error);
            
            return {
                success: false,
                message: "Failed to handle event data in main repository."
            };
        }
    }

    async   postEventSeatRepository(formData:EventSeatDetails,eventId:string){
      try {

        
        // Pass the data to the actual repository for database operations
        const savedEvent = await this.managerEventRepository.createEventSeatInfo(formData, eventId);
        
        return {
            success: true,
            data: savedEvent.data,
            message: "Event successfully saved."
        };
    } catch (error) {
        console.error("Error in postEventRepository:", error);
        
        return {
            success: false,
            message: "Failed to handle event data in main repository."
        };
    } 
    }
    

    async postUpdateEventRepository(formData: EventData, fileName: string[],eventId:string,location:eventLocation) {
      try {
          console.log("Delegating event data to the actual repository...");
          // Pass the data to the actual repository for database operations
          const savedEvent = await this.managerEventRepository.updateEventData(formData,location,fileName,eventId);
          return {
            success: true,
            data: savedEvent.data,
            message: "Event successfully saved."
        };
      } catch (error) {
          console.error("Error in postEventRepository:", error);
          throw new Error("Failed to handle event data in main repository.");
      }
  }

    
    async getEventTypeData(req: Request): Promise<{ success: boolean; message: string; data?: any }> {
      try {
          const result = await CATEGORYDB.find(); // Fetch data from the database
          console.log("DB data", result);
          return { success: true, message: "Event data retrieved successfully", data: result };
      } catch (error) {
          console.error("Error in getEventTypeDataService:", error);
          return { success: false, message: "Internal server error" };
      }
  }


  async getSearchOfferInput(searchData:string): Promise<{ success: boolean; message: string; data?: any }> {
    try {

      const savedEvent =await this.managerOfferRepository.getSearchOfferInput(searchData);
  
        return { success: true, message: "Event data retrieved successfully", data: savedEvent };
    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Internal server error" };
    }
}

  async getAllOfferDetails(managerId:string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const result = await OFFERDB.find({managerId:managerId}); // Fetch data from the database
        console.log("DB data", result);
        return { success: true, message: "Event data retrieved successfully", data: result };
    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Internal server error" };
    }
}



async postOfferDetails(formData: OfferData) {
  try {
    const result=await this.managerOfferRepository.addNewOfferRepository(formData);    // Extract fields from formData
    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Error in postOfferDetails:", error);
    return { success: false, message: "Internal server error" };
  }
}



async updateOfferDetailsRepo(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerOfferRepository.updateOfferRepository(formData);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchManagerWalletRepo(managerId:string){
  try {

   
    const savedEvent = await this.managerOfferRepository.fetchManagerWalletRepository(managerId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in User Wallet Repository:", error);
    throw new Error("Failed to handle user wallet in main repository.");
}
}
async fetchAllCompanyEventRepo(CompanyName: string) {
  const eventDetails = await SOCIALEVENTDB.find({ companyName: CompanyName });
  if (!eventDetails || eventDetails.length === 0) {
      return { success: false, message: "No Events hosted in this company", data: null };
  }
  const actualEvents = eventDetails.filter((event: any) => new Date(event.endDate) > new Date());

  console.log("Actual Events:", actualEvents);

  if (actualEvents.length === 0) {
      return { success: false, message: "No upcoming events in this company", data: null };
  }

  return { success: true, message: "Upcoming events found", data: actualEvents.map((event: any) => event.eventName) };
}


async getManagerProfileRepo(companyName: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ firmName: companyName }); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager profile not found" ,data:null};
    }

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}


async updateManagerProfileRepo(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ email:formData.email}); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager email not found" ,data:null};
    }

    result.phoneNo=formData.phoneNo;
    await result.save();

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}




async updateManagerPasswordRepo(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ email:formData.email}); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager email not found" ,data:null};
    }

    result.password = await hashPassword(formData.newPassword);
    await result.save();

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}
async getAllEventRepo(managerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerEventRepository.getAllEventDetailsRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}


async getSelectedEventRepo(id:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerEventRepository.getSelectedEventRepository(id);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}
async getSelectedEventTicketRepo(id:string){
  try {

    const savedEvent =await this.managerEventRepository.getSelectedEventTicketRepository(id);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getSelectedOfferRepo(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerOfferRepository.getSelectedOfferRepository(offerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getAllVerifierRepo(managerName:string){
  try {

    const savedEvent =await this.managerVerifierRepository.getAllVerifierRepository(managerName);

      return { success: true, message: "Verifier data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in get  verifier details service:", error);
      return { success: false, message: "Internal server error" };
  }

}
async updateVerifierStatusRepo(verifierId:string){
  try {

    const savedEvent =await this.managerVerifierRepository.updateVerifierStatusRepository(verifierId);

      return { success: true, message: "update verifier status successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async postVerifierLoginRepo(formData:verifierFormData){
  try {
console.log("Form from Repo",formData);

    const savedEvent =await this.managerVerifierRepository.postVerifierLoginRepository(formData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async updateVerifierRepo(formData:verifierFormData){
  try {

    const savedEvent =await this.managerVerifierRepository.updateVerifierRepository(formData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchSelectedVerifierRepo(verifierId:string){
  try {

    const savedEvent =await this.managerVerifierRepository.fetchSelectedVerifierRepository(verifierId);

      return { success: true, message: "Verifier data fetched successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in fetching  verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async updateSeatInformationRepo(ticketData:TicketType){
  try {

    const savedEvent =await this.managerEventRepository.updateSeatInformationRepository(ticketData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchManagerNotificationRepo(managerId:string){
  try {
    const notificationData=await NOTIFICATIONDB.find({
      to:managerId
    })
    if(!notificationData){
      return { success: true, message: "No notification in the manager-side", data: null };
    }else{
      return { success: true, message: "notification retrieve successfully", data: notificationData };
    }




  } catch (error) {
      console.error("Error in updating notification:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getTodaysBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTodaysBookingRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getTotalBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTotalBookingRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }

}

async getUserDataRepo(managerName:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.managerBookingRepository.getBookedUserRepository(managerName);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}

}

async createChatSchemaRepo(sender:string,receiver:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.managerBookingRepository.createChatSchemaRepository(sender,receiver);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


}