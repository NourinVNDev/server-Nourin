import {loginRepo} from '../../repository/userRepository/loginRepo';
import GenerateOTP from '../../config/nodemailer';
const { OAuth2Client } = require('google-auth-library');
const refreshTokens = [];
import { ILoginService } from './ILoginService';
import { billingData, FormData, PaymentData, retryBillingData, retryPayment } from '../../config/enum/dto';
import { userDetailsService } from './userDetailsService';
import { userProfileService } from './userProfileService';
import { IloginRepo } from '../../repository/userRepository/IloginRepo';
import { cancelEventService } from './cancelEventService';
import { NotificationVideoCallService } from './notificationVideoService';
import { eventLocation } from '../../config/enum/dto';
import { getCoordinates } from '../../config/getCoordinates';
import Stripe from 'stripe';
import SendBookingConfirmation from '../../config/bookingConfirmation';
import bookingSchema from '../../models/userModels/bookingSchema';
interface BookedUser {
  email: string;
  user: string;
}

interface BookingData {
  data: {
    bookedUser: BookedUser[];
    totalAmount: number;
    NoOfPerson: number;
    bookingId: string;
    bookingDate: string;
  };
}
const stripe = new Stripe(process.env.STRIPE_SERVER_SECRET!,  {apiVersion: '2024-12-18.acacia'});
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
  private cancelEventService:cancelEventService;
  private NotificationService:NotificationVideoCallService;
  private stripe: Stripe;
  constructor(userRepositoryInstance:IloginRepo){
    this.userService=userRepositoryInstance;
    this.userDetailService=new userDetailsService(userRepositoryInstance);
    this.userProfileService=new userProfileService(userRepositoryInstance);
    this.cancelEventService=new cancelEventService(userRepositoryInstance);
    this.NotificationService=new NotificationVideoCallService(userRepositoryInstance);
    this.stripe = new Stripe(process.env.STRIPE_SERVER_SECRET!,{  apiVersion: '2024-12-18.acacia'});
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

      // const isPresent = await this.userService.isEmailPresent(email);

      // if (!isPresent) {
      //   console.log('Email is Not registered');
      //   return {success:false};
      // }

    
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

async resetPasswordDetails(formData: FormData,email:string){
  try {
    console.log("menu",formData,email);
    
    if (email && formData.password && formData.password1) {
      console.log("bhai");
      
      const result = await this.userService.resetPasswordRepo(email,formData);
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
      let location:eventLocation|null=null;
      location=await getCoordinates(formData.address);
      
      const result = await this.userService.resetUserProfile(email,formData,location);
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

async getAllEventServiice(){
  try {

      
      const result = await this.userService.getAllEventBasedRepo();
      return { success: true, message: 'Retriving all event Data', user: result };
 
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

    const result = await this.userDetailService.postLikeService(index,userId,postId);
    console.log("from service", result);

return {result};
  } catch (error) {
  
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}




async handlePostDetailsService(postId:string){
  try {
    
    const result = await this.userDetailService.getPostDetailsService(postId);
    console.log("from service", result);

return {result};
  } catch (error) {
 
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getSelectedEventService(postId:string){
  try {

    const result = await this.userDetailService.getSelectedEventService2(postId);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getBookedEventService(bookingId:string){
  try {

    const result = await this.userDetailService.getCancelBookingEventService2(bookingId);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
  
}

async checkBookedUserValidService(email:string,eventName:string,bookedId:string){
  try {

    const result = await this.userDetailService. checkUserBookingEventService2(email,eventName,bookedId);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

}


async makePaymentStripeService(products:PaymentData){
  try {

    const result = await this.userDetailService.makePaymentStripeService2(products);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async makeRetryPaymentStripeService(products:retryPayment){
  try {

    const result = await this.userDetailService.makeRetryPaymentStripeService2(products);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async posthandleReviewRating(formData:FormData){
  try {
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

    const result = await this.userDetailService.saveBillingDetailsService2(formData);
    console.log("from service", result);
    return {success:result.success,message:result.message,data:result.data};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async saveRetryBillingService(formData:retryBillingData){
    try {

    const result = await this.userDetailService.saveRetryBillingService2(formData);
    console.log("from service", result);
    return {success:result.success,message:result.message,data:result.data};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async updateBookedEventPaymentStatus(bookedId:string){
  try {
    // Fetch data from the repository
    const result = await this.userDetailService.updatePayementStatusService2(bookedId);
    console.log("from service", result);
    if(result){
      return {success:result.success,message:result.message};
    }

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getEventHistoryService(userId:string){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getEventHistoryService2(userId);
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

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getEventBookedService(userId:string){
  try {
    // Fetch data from the repository
    const savedEvent = await this.userProfileService.getEventBookedService2(userId);
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
async cancelBookingEventService(bookingId:string,userId:string){
  try {
    const savedEvent = await this.cancelEventService.cancelEventService2(bookingId,userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in cancelling the booked Event:", error);
    throw new Error("Failed to cancell the booked Event"); 
  }

}
async fetchUserWalletService(userId:string){
  try {
    const savedEvent = await this.cancelEventService.fetchUserWalletService2(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in cancelling the booked Event:", error);
    throw new Error("Failed to cancell the booked Event"); 
  }

}
async  fetchUserNotificationService(userId:string){
  try {
    const savedEvent = await this.NotificationService.fetchUserNotificationService2(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}

async fetchUserNotificationCountService(userId:string){
  try {
    const savedEvent = await this.NotificationService.fetchUserNotificationCountService2(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
  } catch (error) {
    console.error("Error in fetching Notification:", error);
    throw new Error("Failed to fetching notification of user"); 
  }
}

async confirmPayment(rawBody:Buffer,signature:string){


  console.log("Signnature",signature,rawBody);
  
    try {
      const stripeSecret = process.env.STRIPE_SERVER_SECRET;
      const webhookSecret =process.env.STRIPE_WEBHOOK_SECRET

      if (!stripeSecret) {
        console.error("STRIPE_SERVER_SECRET is missing.");
        throw new Error("STRIPE_SERVER_SECRET is not set in environment.");
      }

      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is missing.");
        throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment.");
      }


      const stripe = new Stripe(stripeSecret, {
        apiVersion: '2024-12-18.acacia',
      });

      console.log("Signature:", signature);
      console.log("Raw Body Preview:", rawBody.toString('utf-8').slice(0, 200));

      
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      let paymentData: any;
      console.log("Stripe Event Constructed:", event.type);

      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const managerId=session.metadata?.managerId||"";
        const bookedId=session.metadata?.bookedId||"";
        const bookingId=session.metadata?.bookingId||"";
        const paymentStatus=session.metadata?.paymentStatus||"";
        const userId=session.metadata?.userId||"";
        const sessionId=session.metadata?.sessionId||"";
        const firstName=session.metadata?.firstName||"";
        const lastName=session.metadata?.lastName||"";
        const email=session.metadata?.email||"";
        const phoneNo=session.metadata?.phoneNo||0;
        const address=session.metadata?.address||"";
        const images= JSON.parse(session.metadata?.images || "[]");
        const eventName=session.metadata?.eventName||"";
        const location_address=session.metadata?.location_address||"";
        const location_city=session.metadata?.location_city||"";
        const noOfPerson=session.metadata?.noOfPerson||0;
        const noOfDays=session.metadata?.noOfDays||0;
        const Amount=session.metadata?.Amount||0;
        const type=session.metadata?.type||"";
        const Included=JSON.parse(session.metadata?.Included||"[]");
        const notIncluded=JSON.parse(session.metadata?.notIncluded||"[]");
        const bookedMembers=JSON.parse(session.metadata?.bookedMembers||"[]");
        const bookedEmails=JSON.parse(session.metadata?.bookedEmails||"[]");
        const amount=session.metadata?.amount||0;
        const companyName=session.metadata?.companyName||"";
        const categoryName=session.metadata?.categoryName||""


        paymentData={
          managerId,
          bookedId,
          bookingId,
          userId,
          sessionId,
          firstName,
          lastName,
          email,
          
         phoneNo:Number(phoneNo),
          address,
          images,
          eventName,
          location:{
            address:location_address,
            city:location_city
          },
          noOfPerson:Number(noOfPerson),
          noOfDays:Number(noOfDays),
          Amount:Number(Amount),
          type,
          Included,
          notIncluded,
          bookedMembers,
          bookedEmails,
          amount:Number(amount),
          companyName,
          paymentStatus:paymentStatus,
          categoryName
        }
        let bookingData: BookingData;
    
          bookingData=await this.userService.saveRetryPaymentData(paymentData);
        
        
          
              console.log("Data");
              
    const bookedUsers =bookingData.data.bookedUser;
    const singleAmount=bookingData.data.totalAmount/bookingData.data.NoOfPerson;

    console.log("BookedUser Data:",bookedUsers);
    console.log("Amount:",singleAmount);

    if (Array.isArray(bookedUsers)) {


for (const user of bookedUsers) {
  try {
    await SendBookingConfirmation(
      user.email,
      user.user,
      bookingData.data.bookingId,
      paymentData.eventName,
      bookingData.data.bookingDate,
      1,
      singleAmount,
      paymentData.categoryName

    );


  } catch (error) {
    console.error(`Failed to send confirmation to ${user.email}`, error);
  }
}


    } 
      return {success:true,message:'Saved Booked User Information',data:null}
      } else {
        console.log("Hai");
        
        if (paymentData.bookingId) {

          console.log("Dash",paymentData.bookingId);
          
    await this.userService.handleCancelPayment(paymentData.bookingId);
  }
      }
    

    } catch (err: any) {
      // Stripe-specific verification error
      if (err.type === 'StripeSignatureVerificationError') {
        console.error("🚫 Invalid Stripe Webhook Secret or Signature.");
        console.error("🔎 Possible reasons:");
        console.error(" - Incorrect STRIPE_WEBHOOK_SECRET");
        console.error(" - Wrong endpoint secret used");
        console.error(" - Raw body was parsed before reaching Stripe webhook");
        console.error("📄 Error Message:", err.message);
      } else if (err.code === 'ERR_STRIPE_SECRET_INVALID') {
        console.error("❌ Stripe Server Secret is incorrect.");
      }
    }


}


async getBookedManagerService(userId:string){
  try {

    const savedEvent = await this.userProfileService.getBookedManagerService2(userId);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};

  } catch (error) {

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

    const savedEvent = await this.userProfileService.createChatSchemaService2(userId,manager);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};

  } catch (error) {
   
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




