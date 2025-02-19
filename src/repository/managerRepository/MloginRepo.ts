import MANAGERDB from '../../models/managerModels/managerSchema';
import { IMloginRepo } from './IMloginRepo';
import { EventData, FormData1, OfferData } from '../../config/enum/dto';
import { managerEventRepository } from './mEventRepo';
import { Request,Response } from 'express';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import OFFERDB from '../../models/managerModels/offerSchema';
import { managerOfferRepository } from './mOfferRepo';
import { managerBookingRepository } from './mBookingUserRepo';

interface User {
    email: string;
    password: string; // Password is of type string
  }

import bcrypt  from 'bcrypt';
const hashPassword = async (password:string) => {
  try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10); // 10 is the salt rounds
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);
      
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
  constructor(){
    this.managerEventRepository=new managerEventRepository();
    this.managerOfferRepository=new managerOfferRepository();
    this.managerBookingRepository=new managerBookingRepository();
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
            console.log('User not found.');
            return {
              success: false,
              message: 'User not found.',
              user: null,
            };
          }
          return {
            success: true,
            message: 'Login successful.',
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
      async resetPasswordRepoForManager(email:string, password:string,password1:string){
   
        const confirmPassword=password1;
      
        // Validate input
        console.log("Last checking",password,confirmPassword,email);
        
        if (!email || !password || !confirmPassword) {
          console.log('Email, password, or confirm password is missing.');
          return {
            success: false,
            message: 'Email, password, and confirm password are required.',
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
            console.log('Checking email:',email)
          // Check if the user exists (ensuring the user is a Document)
          const user = await MANAGERDB.findOne({email});
          console.log('User',user);
      
          if (!user) {
            console.log('User not found.');
            return {
              success: false,
              message: 'User not found.',
              user: null,
            };
          }
      
          // Hash the password (asynchronous)
          const hashedPassword = await hashPassword(password);
      
          // Update the user's password
          user.password = hashedPassword;
      
          // Ensure you're calling `save()` on a Mongoose document instance
          await user.save();
      
          console.log('Password reset successful.');
          return {
            success: true,
            message: 'Password reset successful.',
            user: { id: user._id, email: user.email }, // Return limited user info
          };
        } catch (error) {
          console.error('Error during password reset:', error);
          return {
            success: false,
            message: 'An error occurred during password reset.',
            user: null,
          };
        }
      }
      async postEventRepository(formData: EventData, fileName: string) {
        try {
            console.log("Delegating event data to the actual repository...");
            
            // Pass the data to the actual repository for database operations
            const savedEvent = await this.managerEventRepository.createEventData(formData, fileName);
            
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
    

    async postUpdateEventRepository(formData: EventData, fileName: string[],eventId:string) {
      try {
          console.log("Delegating event data to the actual repository...");
          // Pass the data to the actual repository for database operations
          const savedEvent = await this.managerEventRepository.updateEventData(formData,fileName,eventId);
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

  async getAllOfferDetails(req: Request,res:Response): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const result = await OFFERDB.find(); // Fetch data from the database
        console.log("DB data", result);
        return { success: true, message: "Event data retrieved successfully", data: result };
    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Internal server error" };
    }
}



async postOfferDetails(formData: OfferData) {
  try {
    // Extract fields from formData
    const { offerName, discount_on, discount_value, startDate, endDate, item_description } = formData;

    // Check if an active offer already exists for this discount_on
    const activeOffer = await OFFERDB.findOne({
      discount_on,
      endDate: { $gt: new Date() }, // Ensure existing offer's endDate is in the future
    });

    if (activeOffer) {
      return {
        success: false,
        message: `An active offer already exists for "${discount_on}".`,
        data: [],
      };
    }

    // Create new offer
    const newOffer = await OFFERDB.create({
      offerName,
      discount_on,
      discount_value,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      item_description,
    });

    console.log("New offer added:", newOffer);

    // Fetch all offers from DB
    const allOffers = await OFFERDB.find();
    console.log("All offers:", allOffers);

    return {
      success: true,
      message: "Offer added successfully and data retrieved.",
      data: allOffers,
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

    result.password=formData.newPassword;
    await result.save();

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}
async getAllEventRepo(req: Request,res:Response): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerEventRepository.getAllEventDetailsRepository(req,res);

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

async getSelectedOfferRepo(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerOfferRepository.getSelectedOfferRepository(offerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getTodaysBookingRepo():Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTodaysBookingRepository();

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getTotalBookingRepo():Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTotalBookingRepository();

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }

}


}