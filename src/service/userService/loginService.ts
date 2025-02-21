import {loginRepo} from '../../repository/userRepository/loginRepo';
import GenerateOTP from '../../config/nodemailer';
const { OAuth2Client } = require('google-auth-library');
const refreshTokens = [];
import { ILoginService } from './ILoginService';
import { billingData, FormData, PaymentData } from '../../config/enum/dto';
import { userDetailsService } from './userDetailsService';
import { userProfileService } from './userProfileService';
import { IloginRepo } from '../../repository/userRepository/IloginRepo';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface AuthTokens {
  id_token: string;
  access_token: string;
}

export class loginServices  implements ILoginService {

  private userService:IloginRepo;
  private userDetailService:userDetailsService;
  private userProfileService:userProfileService;
  constructor(userRepositoryInstence:IloginRepo){
    this.userService=userRepositoryInstence;
    this.userDetailService=new userDetailsService(userRepositoryInstence);
    this.userProfileService=new userProfileService(userRepositoryInstence);
  }

  async getAllEventService(): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
      const result = await this.userService.getEventDataRepo();
      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      // Handle the error and return an appropriate response
      return { success: false, message: "Failed to fetch events", data: [] };
    }
  }
  
  async CheckingEmail(email: string){
    try {
      if (!email) {
        throw new Error('Email not provided');
      }

      const isPresent = await this.userService.isEmailPresent(email);
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

  async generateOtpService(userId: string){
    try {
      if (!userId) {
        throw new Error('UserId not provided');
      }

    

      console.log('Email is not registered');
      const otp = generateOTP();
      const userData=await this.userService.fetchuserEmail(userId)
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

  


  async CheckingEmailForResendOtp(email: string){
    try {
      if (!email) {
        throw new Error('Email not provided');
      }

      const isPresent = await this.userService.isEmailPresent(email);

      if (!isPresent) {
        console.log('Email is Not registered');
        return {success:false};
      }

    
      const otp = generateOTP();
      console.log('Generated OTP:', otp);
      GenerateOTP(email, otp);
      return { success: otp };
    } catch (error) {
      console.error(
        `Error in CheckingEmail service for email "${email}":`,
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

  
 async verifyService( formData:FormData, otp: string, globalOTP: string | number | null ){
    try {
      if (globalOTP !== null && parseInt(otp, 10) === globalOTP) {
        const result = await this.userService.postUserData(formData);
        return { success: true, message: 'User data saved successfully', user: result };
      } else {
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

  async loginDetails(formData: FormData) {
    try {
      if (formData.email && formData.password) {
        const result = await this.userService.checkLogin(formData);

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

   const result= await this.userService.googleAuthData(payload);
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
    const result = await this.userService.isEmailValid(email);

    // If the result indicates failure, return it directly to the controller
    if (!result.success) {
      return { success: false, message: result.message, otpValue: null };
    }

    // Generate OTP if email is valid
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // const recipient = { email: 'nourinvn@gmail.com' };
    // const { email } = recipient;
    // console.log(email);

    try {
      // Send OTP
      await GenerateOTP(email, otp);
    } catch (err) {
      console.error('Error sending OTP:', err);
      throw new Error('Failed to send OTP.');
    }

    // Return success response with the generated OTP
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

async resetPasswordDetails(formData: FormData,userId:string){
  try {
    console.log("menu",formData,userId);
    
    if (userId && formData.password && formData.password1) {
      console.log("bhai");
      
      const result = await this.userService.resetPasswordRepo(userId,formData);
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


async changeUserProfileService(formData: FormData,email:string){
  try {
  
    
    if (email && formData.firstName && formData.lastName && formData.phoneNo && formData.address) {
      console.log("bhai");
      
      const result = await this.userService.resetUserProfile(email,formData);
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

      
      const result = await this.userService.getAllCategoryRepository();
      return { success: true, message: 'Reset Password SuccessFully', user: result };
    
  }catch (error) {
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
      
      const result = await this.userService.getUserDetailsRepository(userId);
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

async getCategoryBasedServiice(postId:string){
  try {
    console.log("menu",postId);
    
    if (postId) {
      console.log("PostId is required",postId);
      
      const result = await this.userService.getCategoryBasedRepo(postId);
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





async getCategoryTypeServiice(categoryName:string){
  try {
    console.log("menu",categoryName);
    
    if (categoryName) {
      console.log("bhai");
      
      const result = await this.userService.getCategoryTypeRepo(categoryName);
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


async posthandleLikeForPost(index:string,userId:string,postId:string){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.postLikeService(index,userId,postId);
    console.log("from service", result);
    //  return { success: result.success, message: result. message, data: result.data };
return {result};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}




async handlePostDetailsService(postId:string){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.getPostDetailsService(postId);
    console.log("from service", result);
    //  return { success: result.success, message: result. message, data: result.data };
return {result};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getSelectedEventService(postId:string){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.getSelectedEventService2(postId);
    console.log("from service", result);
    //  return { success: result.success, message: result. message, data: result.data };
return {result};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}


async makePaymentStripeService(products:PaymentData){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.makePaymentStripeService2(products);
    console.log("from service", result);
    //  return { success: result.success, message: result. message, data: result.data };
return {result};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async posthandleReviewRating(formData:FormData){
  try {
    // Fetch data from the repository
    const result = await this.userProfileService.postReviewRating(formData);
    console.log("from service", result);
    //  return { success: result.success, message: result. message, data: result.data };
return {result};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}



async saveBillingDetailsService(formData:billingData){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.saveBillingDetailsService2(formData);
    console.log("from service", result);
    return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

}

async updateBookedEventPaymentStatus(bookedId:string){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.updatePayementStatusService2(bookedId);
    console.log("from service", result);
    return {success:result.success,message:result.message};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getEventHistoryService(){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getEventHistoryService2();
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}



async getExistingReviewService(userId:string,eventId:string){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getExistingReviewService2(userId,eventId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getEventBookedService(){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getEventBookedService2();
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async checkOfferAvailableService(categoryName:string){
  try {
    const savedEvent = await this.userService.checkOfferAvailableRepo(categoryName);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

}


async getBookedManagerService(userId:string){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getBookedManagerService2(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

  

}

async createChatSchemaService(formData:FormData){
  try {
    const {userId,manager}=formData;
    if(!userId){
      return {success:false,message:'User is not Found',data:null};
    }
    if(!manager){
      return {success:false,message:'Manager is not Found',data:null};
    }
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.createChatSchemaService2(userId,manager);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

  

}
async uploadUserProfilePhoto(userId:string,profilePicture:Express.Multer.File){
  try {
   
    if(!userId){
      return {success:false,message:'User is not Found',data:null};
    }
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.uploadUserProfileService2(userId,profilePicture);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
    // return {success:result.success,message:result.message,data:result.data};
  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

};




