import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IUserLoginRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IUserLoginRepo";
import { FormData } from "../../dtos/user.dto";
import GenerateOTP from "../../config/nodemailer.config";
const { OAuth2Client } = require('google-auth-library');
import { eventLocation } from "../../dtos/user.dto";
import { getCoordinates } from "../../utils/getCoordinates.util";
import { IUserLoginService } from "../../interfaces/userInterfaces/serviceInterfaces/IUserLoginService";
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
  
}
@injectable()
export class UserLoginService implements IUserLoginService{
    constructor(
        @inject(TYPES.IUserLoginRepo) private _userLoginRepo:IUserLoginRepo
    ){}

      async getAllEventService() {
    try {
      const result = await this._userLoginRepo.getEventDataRepo();
      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      // Handle the error and return an appropriate response
      return { success: false, message: "Failed to fetch events", data: [] };
    }
  }
    async loginDetails(formData: FormData) {
    try {
      if (formData.email && formData.password) {
        const result = await this._userLoginRepo.checkLogin(formData);

      if (result?.success) {
                return {
                    success: true,
                    message: 'Login successful',
                    user: result.user, // Assuming `user` is part of `result`
                    categoryNames:result.user
                };
            } else {
                // Handle failed login based on service response
                return {
                    success: false,
                    message: 'Invalid login credentials.',
                };
            }
        } else {
            throw new Error('Email and password are required.');
        }
    } catch (error) {
      console.error(
        `Error in loginDetails:`,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error verifying login credentials');
    }
  }
    async CheckingEmail(email: string){
    try {
      if (!email) {
        throw new Error('Email not provided');
      }

      const isPresent = await this._userLoginRepo.isEmailPresent(email);
      console.log('contry', isPresent)

      if (isPresent.user===true) {
        console.log('Email is already registered');
        return {success:false};
      }

      console.log('Email is not registered');
      const otp = generateOTP();
      console.log('Generated OTP:', otp);
      GenerateOTP(email, otp);
      return { success: Number(otp) };
    } catch (error) {
      console.error(
        `Error in CheckingEmail service for email "${email}":`,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error checking email');
    }
  }
   async verifyService( formData:FormData, otp: string, globalOTP: string | number | null ){
    try {
      if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
        const result = await this._userLoginRepo.postUserData(formData);
        return { success:result.success, message: result.message, user: result.user };
      } else {
        return { success:false, message:'Invalid OTP. Please try again.', user:null};
      }
    } catch (error) {
      console.error(
        `Error in verifyService:`,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error verifying OTP or saving user data');
    }
  }
    async CheckingEmailForResendOtp(email: string){
    try {
      if (!email) {
        throw new Error('Email not provided');
      }
      const otp = generateOTP();
      console.log('Generated OTP:', otp);
      GenerateOTP(email, otp);
      return { success: Number(otp)};
    } catch (error) {
      console.error(
        `Error in CheckingEmail service for email "${email}":`,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error checking email');
    }
  }
  async GoogleAuth(AuthData: string){
  try {
    let parsedData: { id_token: string; access_token: string };

    if (typeof AuthData === 'string') {
      parsedData = JSON.parse(AuthData);
    } else {
      parsedData = AuthData as { id_token: string; access_token: string };
    }

    const { id_token, access_token } = parsedData;

    const client = new OAuth2Client('690093010048-64jvock1lfgfkup7216jgehn5ofpafo4.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: '690093010048-64jvock1lfgfkup7216jgehn5ofpafo4.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    console.log("Payload:", payload);

   const result= await this._userLoginRepo.googleAuthData(payload);
   return { success: true, message: 'Login Successful', user:result };

  } catch (error) {
    console.error("Error during GoogleAuth:", error);
    throw new Error('Failed to authenticate with Google.');
  }
}
async forgotEmailDetails(email: string) {
  try {
    if (!email) {
      throw new Error('Invalid email provided.');
    }

    // Check if the email is valid
    const result = await this._userLoginRepo.isEmailValid(email);

    // If the result indicates failure, return it directly to the controller
    if (!result.success) {
      return { success: false, message: result.message, otpValue: null };
    }

    // Generate OTP if email is valid
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
      await GenerateOTP(email, otp);
    return { success: true, message: 'OTP sent successfully', otpValue: otp };
  } catch (error) {
    console.error(
      'Error in forgotEmailDetails:',
      error instanceof Error ? error.message : error
    );
    throw new Error('Error verifying email.');
  }
}
async verifyForgotOtpService(otp: string, globalOTP: string | number | null ){
  try {
    if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
      return { success: true, message: 'Otp Matched For Forgot Password' };
    } else {
      return { success: false, message: 'Otp is Not matched' };
      throw new Error('Invalid OTP. Please try again.');
    }
  } catch (error) {
    console.error(
      `Error in verifyService:`,
      error instanceof Error ? error.message : error
    );
    throw new Error('Error verifying OTP or saving user data');
  }
}
async getCategoryTypeServiice(categoryName:string){
  try {
    console.log("menu",categoryName);
    
    if (categoryName) {
      console.log("bhai");
      
      const result = await this._userLoginRepo.getCategoryTypeRepo(categoryName);
      return { success: true, message: 'Reset Password SuccessFully', user: result.category };
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
async getUserProfileDetailsService(userId:string){
  try {
    console.log("Mahn",userId);
    
    if (userId) {
      console.log("bhai");
      
      const result = await this._userLoginRepo.getUserDetailsRepository(userId);
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
async getWholeCategoryDetails(){
  try {

      
      const result = await this._userLoginRepo.getAllCategoryRepository();
      return { success: true, message: 'Reset Password SuccessFully', user: result };
    
  }catch (error) {
    console.error(
      `Error in loginDetails:`,
      error instanceof Error ? error.message : error
    );
    throw new Error('Error verifying login credentials');
  }
}
async changeUserProfileService(formData: FormData,email:string){
  try {
  
    
    if (email && formData.firstName && formData.lastName && formData.phoneNo && formData.address) {
      console.log("bhai");
      let location:eventLocation|null=null;
      location=await getCoordinates(formData.address);
      
      const result = await this._userLoginRepo.resetUserProfile(email,formData,location);
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
async resetPasswordDetails(formData: FormData,email:string){
  try {
    console.log("menu",formData,email);
    
    if (email && formData.password && formData.password1) {
      console.log("bhai");
      
      const result = await this._userLoginRepo.resetPasswordRepo(email,formData);
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
async getAllEventServiice(){
  try {

      
      const result = await this._userLoginRepo.getAllEventBasedRepo();
      return { success: true, message: 'Retriving all event Data', user: result };
 
  } catch (error) {
    console.error(
      `Error in loginDetails:`,
      error instanceof Error ? error.message : error
    );
    throw new Error('Error verifying login credentials');
  }

}
  async generateOtpService(userId: string){
    try {
      if (!userId) {
        throw new Error('UserId not provided');
      }

    

      console.log('Email is not registered');
      const otp = generateOTP();
      const userData=await this._userLoginRepo.fetchuserEmail(userId)
      console.log('Generated OTP:', otp);
      GenerateOTP(userData.user as string, otp);
      return { success: Number(otp) };
    } catch (error) {
      console.error(
        `Error in CheckingEmail service for email `,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error checking email');
    }
  }
  async verifyOtpCheckingService(otp: string, globalOTP: string | number | null ){
    try {
      if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
       
        return { success: true, message: 'Otp are Matched'};
      } else {
        return { success: false, message: 'Otp are not Matched'};
      }
    } catch (error) {
      console.error(
        `Error in verifyService:`,
        error instanceof Error ? error.message : error
      );
      throw new Error('Error verifying OTP or saving user data');
    }
  }
  async checkOfferAvailableService(categoryName:string){
  try {
    const savedEvent = await this._userLoginRepo.checkOfferAvailableRepo(categoryName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

}



}