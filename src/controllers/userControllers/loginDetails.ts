import { Request, response, Response } from 'express';
import axios, { request }  from 'axios';
import { generateAccessToken, generateRefreshToken } from '../../../src/config/authUtils';
import {loginServices} from '../../service/userService/loginService';
import { userDetailsController } from './userDetailsController';
import { ILoginService } from '../../service/userService/ILoginService';
import jwt from 'jsonwebtoken';
import { userProfileController } from './userProfileController';
import HTTP_statusCode from '../../config/enum/enum';
import { CancelBookedEventController } from './cancelBookedEventController';
import { NotificationVideoCallController } from './NotificationVideoCall';
import SendBookingConfirmation from '../../config/bookingConfirmation';
import Stripe from 'stripe';
import { log } from 'node:console';
import response_message from '../../config/enum/response_message';
import e from 'cors';
interface UserPayload {
  email: string;
  role:string
}




let globalOTP: number | null = null;
const refreshTokens: string[] = [];
class userlogin  {

  private userController:ILoginService;
  private userDetailsController:userDetailsController;
  private userProfileController:userProfileController;
  private cancelEventController:CancelBookedEventController;
  private notificationVideoCallCOntroller:NotificationVideoCallController
  constructor(userServiceInstance:loginServices){
    this.userController=userServiceInstance;
    this.userDetailsController=new userDetailsController(userServiceInstance);
    this.userProfileController=new userProfileController(userServiceInstance);
    this.cancelEventController=new CancelBookedEventController(userServiceInstance);
    this.notificationVideoCallCOntroller=new NotificationVideoCallController(userServiceInstance);
  }


  async getAllEventData(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userController.getAllEventService();
      res.status(HTTP_statusCode.OK).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error during event fetching:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.GETALLEVENTDATA_ERROR,
        data: []
      });
    }
  }
  

  async loginDetails(req: Request, res: Response): Promise<void> {
    try {
        const formData = req.body;
        console.log("Login Request Data:", formData);

        const result = await this.userController.loginDetails(formData);

        if (result?.success && result.user) {
         
            console.log("User",result.user.email)
            
            let user = { email: result.user.email, role: 'user' };

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            console.log("Generated Tokens:", { accessToken, refreshToken });

            refreshTokens.push(refreshToken);

            
            res.cookie('accessToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 2 * 60 * 1000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });


            res.status(HTTP_statusCode.OK).json({
                message: response_message.LOGINDETAILS_SUCCESS,
                data: result.user, 
                categoryNames:result.categoryName
            });
        } else {
            res.status(HTTP_statusCode.Unauthorized).json({
                success: false,
                message: response_message.LOGINDETAILS_FAILED,
            });
        }
    } catch (error: any) {
        console.error("Error in loginDetails:", error.message || error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.FETCHADMINDASHBOARDDATA_ERROR});
    }
}


  async postUserDetails(req: Request, res: Response): Promise<void>{
    console.log("hai");
    
    try {
        const email = req.body.email;
        console.log('hello', email);

        const otpNumber = await this.userController.CheckingEmail(email);
        if(otpNumber.success){
          if (typeof otpNumber.success === 'boolean') {
            // Handle the case where otpNumber is a boolean
            console.error("Received a boolean value instead of a number:", otpNumber);
            res.status(HTTP_statusCode.BadRequest).json({ error: response_message.MANAGERREGISTER_FAILED });
            return;
        } else if(typeof otpNumber.success==='number') {
          console.log("check otp",globalOTP);
          
            globalOTP = otpNumber.success; // If it's already a number
        }
        console.log('Checking',otpNumber);
        console.log("Hash",globalOTP);
        

          res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERREGISTER_SUCCESS, otpData: otpNumber });

        }else{
          res.status(HTTP_statusCode.OK).json({error:response_message.POSTUSERDETAILS_FAILED})
        }
    
      
    } catch (error) {
        console.error("Error saving user data:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR

        });
    }
}
    async generateOtpForPassword(req: Request, res: Response): Promise<void>{

      
      try {
          const userId = req.params.userId;

          const otpNumber = await this.userController.generateOtpService(userId);
      
           if (typeof otpNumber.success === 'boolean') {
            // Handle the case where otpNumber is a boolean
            console.error("Received a boolean value instead of a number:", otpNumber);
            res.status(HTTP_statusCode.BadRequest).json({ error: response_message.MANAGERREGISTER_FAILED });
            return;
        } else if(typeof otpNumber.success==='number') {
          console.log("check otp",globalOTP);
          
            globalOTP = otpNumber.success; // If it's already a number
        }
        console.log('Checking',otpNumber);
        console.log("Hash",globalOTP);
        

          res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERREGISTER_SUCCESS, otpData: otpNumber });
      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
      }
  }

  async verifyOtpForPassword(req: Request, res: Response): Promise<void>{
    try{
      
      const {otp} = req.body;
      console.log("Check the Otp",otp);
      console.log("Received OTP:", otp, "Global OTP:", globalOTP);
      const result=this.userController.verifyOtpCheckingService(otp,globalOTP);
      if((await result).success){
        res.status(HTTP_statusCode.OK).json({ message: response_message.VERIFYOTPFORPASSWORD_SUCCESS});
      }else{
        res.status(HTTP_statusCode.BadRequest).json({ message: response_message.VERIFYOTPFORPASSWORD_FAILED });
      }
    
    } catch (error) {
        console.error("Error saving user data:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
    }

  }

    
  
    async verifyOTP(req: Request, res: Response): Promise<void> {
      try {
          const otp = req.body.otp;
          const formData = req.body;
          console.log("Received OTP:", otp, "Global OTP:", globalOTP);

          const result = await this.userController.verifyService(formData, otp, globalOTP);

          console.log("Result from backend", result);

          if (result.success) {
              res.status(HTTP_statusCode.OK).json({
                  success: result.success,
                  message: result.message,
                  data: result.user
              });
          }else{
            res.status(HTTP_statusCode.OK).json({
              success: result.success,
              message: result.message,
              data: result.user
          });
          }

        

      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
      }
  }

    async resendOtp(req:Request,res:Response):Promise<void>{

      try {
        const email = req.body.email;
        console.log(email,'hhhhh');
        const otpNumber = await this.userController.CheckingEmailForResendOtp(email);
        console.log(otpNumber,"cat",typeof otpNumber);
        
        if (typeof otpNumber.success === 'boolean') {
          // Handle the case where otpNumber is a boolean
          console.error("Received a boolean value instead of a number:", otpNumber);
          res.status(HTTP_statusCode.BadRequest).json({ error: response_message.MANAGERREGISTER_FAILED});
          return;
      } else if(typeof otpNumber.success==='number') {
        console.log("check otp",globalOTP);
        
          globalOTP = otpNumber?.success; // If it's already a number
      }
      console.log("Hashing",globalOTP);
      

        res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERREGISTER_SUCCESS, otpData: otpNumber });
        
      } catch (error) {
        console.error("Error saving user data:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
    }
    }
    async googleAuth(req: Request, res: Response): Promise<void>{
      console.log(
        "Is working");
             const { code } = req.body;
      
        try {
          const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
              code,
              client_id:process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              redirect_uri: 'postmessage',
              grant_type: 'authorization_code',
            }
          );
      
          const data = response.data as string;
          console.log("Received Google Data:", data);
      
          const result=await this.userController.GoogleAuth(data);
          if(result.user && result.user.user?.email){
            const user={email:result.user.user?.email,role:'user'};
            const accessToken=generateAccessToken(user);
            const refreshToken=generateRefreshToken(user);

            res.cookie('accessToken', accessToken, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
          });

          res.cookie('refreshToken', refreshToken, {
              httpOnly: false,
              secure: process. env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
          });

            res.status(HTTP_statusCode.OK).json({ message:response_message.LOGINDETAILS_SUCCESS,data:result.user });
          } else {
            res.status(HTTP_statusCode.Unauthorized).json({
                success: false,
                message: response_message.LOGINDETAILS_FAILED,
            });
        }
      
        

      
        } catch (error) {
          console.error('Error saving user data:', error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
        }
      
    }
    async forgotPassword(req: Request, res: Response): Promise<void> {
      console.log("Hello");
  
      try {
          const { email } = req.body;
          console.log(email);
  
          const result = await this.userController.forgotEmailDetails(email);
  
          if (result.success) {
              // Only assign to globalOTP if result.success is true
              globalOTP = Number(result.otpValue);
              res.status(HTTP_statusCode.OK).json({ message:response_message.FORGOTPASSWORD_SUCCESS, data: result.otpValue });
          } else {
              // Handle the case where success is false
              res.status(HTTP_statusCode.BadRequest).json({ message: result.message });
          }
      } catch (error) {
          console.error("Error in forgotPassword:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
      }
  }
  
    
    async  verifyForgotOtp(req: Request, res: Response): Promise<void>{
      try{
        console.log("Try again!");
        
        const otp = req.body.otp;
        const email=req.body.email;
        console.log(req.body);
        
        
     
        console.log(otp,email);
    

        console.log("Received OTP:", otp, "Global OTP for ForgotPassword:", globalOTP);
        let result=this.userController.verifyForgotOtpService(otp,globalOTP);
        console.log("can",result);
        
        res.status(HTTP_statusCode.OK).json({ message: response_message.VERIFYFORGOTOTP_SUCCESS,data:(await result).message});
      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
      }

    }
    async resetPassword(req: Request, res: Response): Promise<void>{
      try {
        const password=req.body.password;
        const password1=req.body.confirmPassword
       const formData={'password':password,'password1':password1};
       console.log("here",formData);
       
       const email=req.body.email;
       console.log(req.body);
       console.log(email);
       
      let result= this.userController.resetPasswordDetails(formData,email);
       res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

      } catch (error) {
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
      }
  }

  async handleResetPassword(req: Request, res: Response): Promise<void>{
    try {
      console.log("Body",req.body);
      const password=req.body.password;
      const password1=req.body.confirmPassword;
     const formData={'password':password,'password1':password1};
     console.log("here",formData);
     
     const userId=req.body.userId;
     console.log(req.body);
     console.log(userId);
     
    let result= this.userController.resetPasswordDetails(formData,userId);
     res.status(HTTP_statusCode.OK).json({ message:response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
    }
}


  

  
  async changeUserProfileDetails(req: Request, res: Response): Promise<void>{
    try {
      const formData=req.body;
    
  
     console.log("here",formData);
     
     const email=formData.email||formData.user.email;

     console.log(email);
     
    let result= this.userController.changeUserProfileService(formData,email);
     res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error:response_message.CREATEADMINDATA_ERROR});
    }
}

  
 
  async getAllCategoryDetails(req:Request,res:Response):Promise<void>{
    try {
 

        const result = await this.userController.getWholeCategoryDetails(); // No res here, just the result

        // Check if the result is successful or not
        if (!result.success) {
             res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
            data: result.user.category
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }

  }

  
  async setProfileDetails(req:Request,res:Response):Promise<void>{
    try {
      console.log("Findd",req.params);
      
      const {userId}  =req.params;
      console.log('mouse',userId);
        const result = await this.userController.getUserProfileDetailsService(userId); // No res here, just the result

        // Check if the result is successful or not
        if (!result.success) {
             res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message:response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
            data: result.user
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }

  }

  async reGenerateAccessToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
  console.log("Refresh Token",refreshToken);
    if (!refreshToken) {
      console.log("snake");
      
      res.status(HTTP_statusCode.NotFound).json({
        success: false,
        message: response_message.REGENERATEACCESSTOKEN_FAILED,
      });
      return; // End the execution
    }
  
    try {
      // Ensure the REFRESH_TOKEN_SECRET is available
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      console.log("From Process",refreshTokenSecret);
      if (!refreshTokenSecret) {
        res.status(HTTP_statusCode.InternalServerError).json({
          success: false,
          message: "Refresh token secret not defined in environment variables",
        });
        return; // End the execution
      }
  
      // Verify the refresh token and decode the payload
      const user = jwt.verify(refreshToken, refreshTokenSecret) as UserPayload;
      console.log("Again Checking",user);
      // Ensure the email exists in the decoded token
      if (!user.email) {
        res.status(HTTP_statusCode.NotFound).json({
          success: false,
          message: "Invalid refresh token: email not found",
        });
        return; // End the execution
      }
  
      // Generate a new access token
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        res.status(HTTP_statusCode.InternalServerError).json({
          success: false,
          message: response_message.REGENERATEACCESSTOKEN_ERROR,
        });
        return; 
      }
  
      const accessToken = jwt.sign(
        { email: user.email,role:user.role},
        accessTokenSecret,
        { expiresIn: "15m" }
      );
      res.cookie('accessToken', accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge:2*60*1000
    });
  
      res.status(200).json({
        success: true,
        message: "Access token regenerated successfully",
        accessToken: accessToken,
      });
      return; 
    } catch (error) {
      console.error("Error verifying refresh token:", error);
      res.status(HTTP_statusCode.Unauthorized).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }
  }

    async getAnEventDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const postId  =req.params.postId;
      console.log('cat',postId);
        const result = await this.userController.getCategoryBasedServiice(postId);
        console.log("Result",result);

     
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
            data: result  
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
}


async getAllEventDetails(req: Request, res: Response): Promise<void|any> {
  console.log("Blank");
  
  try {
      const result = await this.userController.getAllEventServiice();
      console.log("Result",result);

      if (!result.success) {
          return res.status(HTTP_statusCode.InternalServerError).json({
              message: result.message
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
          data: result  
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}




  

  async getCategoryTypeDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const categoryName  =req.params.category;
      console.log('cat',categoryName);
        const result = await this.userController.getCategoryTypeServiice(categoryName); // No res here, just the result

       
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
            data: result.user
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
}
async postHandleLike(req:Request,res:Response){
  try {

    
    const index  =req.body.index;
    const userId=req.body.userId;
    const postId=req.body.postId;
    console.log('cat',userId,index,postId);
      const result = await this.userDetailsController.handleLikeForPost(index,userId,postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message:response_message.POSTHANDLELIKE_SUCCESS,
         data: {result}
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}

async getPostDetails(req:Request,res:Response){
  try {
    const postId=req.params.postId;
      const result = await this.userDetailsController.handlePostDetails(postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }


}

async getSelectedEventDetails(req:Request,res:Response){
  try {
    const postId=req.params.id;
      const result = await this.userDetailsController.getSelectEventController(postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}
async fetchSavedBookingdata(req:Request,res:Response){
  try {
    const bookingId=req.params.bookingId;
      const result = await this.userDetailsController.getSelectedBookingData(bookingId); 
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}
async checkIfUserValid(req:Request,res:Response){
  console.log("aaa",req.params);
  
    try {
      console.log("Yeah",req.params);
      
    const email=req.params.email;
    const eventName=req.params.eventName;
    const bookedId=req.params.bookedId;
    console.log("Email,EventName",email,eventName);
      const result = await this.userDetailsController.checkUserIsBooked(email,eventName,bookedId); 
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message:response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }

}
async makePaymentStripe(req: Request, res: Response): Promise<void> {
  try {
    const { products } = req.body;
    const result = await this.userDetailsController.makePaymentStripeController(products);

    if (!result.result.success) {
      res.status(HTTP_statusCode.OK).json({
        message: result.result.message,
        success: true,
      });
      return;
    }
    
 

    console.log("Checking server-side", result);

    res.status(HTTP_statusCode.OK).json({
      message: response_message.GETPOSTDETAILS_SUCCESS,
      sessionId: result.result.data,
      success:true
    });
    return;

  } catch (error) {
    console.error("Error in getCategoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ 
      message: response_message.FETCHADMINDASHBOARDDATA_ERROR, 
      error 
    });
    return;
  }
}

async handleWebhook(req:Request,res:Response){
      try {
        console.log("Handle");
       const stripe = new Stripe(process.env.STRIPE_SERVER_SECRET as string, {
      apiVersion: '2024-12-18.acacia',
    });
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        throw new Error("Missing Stripe signature");
      }
         const rawBody = req.body as Buffer;
      await this.userController.confirmPayment(rawBody, signature);

      res.status(HTTP_statusCode.OK).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(HTTP_statusCode.InternalServerError).send(`Webhook Error: ${error.message}`);

    }
}


async makerRetryPayment(req:Request,res:Response){
  try {
    const { products } = req.body;
    console.log("Logging",products.bookedEmails);
    
    const result = await this.userDetailsController.makeRetryPaymentStripeController(products);

    if (!result.result.success) {
      res.status(HTTP_statusCode.OK).json({
        message: result.result.message,
        success: true,
      });
      return;
    }
    
   


    console.log("Checking server-side", result);

    res.status(HTTP_statusCode.OK).json({
      message:response_message.GETPOSTDETAILS_SUCCESS,
      sessionId: result.result.data,
      success:true
    });
    return;

  } catch (error) {
    console.error("Error in getCategoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ 
      message: response_message.FETCHADMINDASHBOARDDATA_ERROR, 
      error 
    });
    return;
  }

}




async postReviewAndRating(req:Request,res:Response){
  try{
    console.log('have',req.body);
  
    const formData=req.body;
    console.log('FormData',formData);
    const result=await  this.userProfileController.addReviewRatingController(formData)
    res.status(HTTP_statusCode.OK).json({result:result.result.savedEvent});
  } catch (error) {
    console.error("Error in post review and Rating", error);
    res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
}


}


async saveBillingDetails(req: Request, res: Response) {
  try {
    const formData = req.body;
    console.log("Received billing details:", formData);

    const result = await this.userDetailsController.saveBillingDetails2(formData);
    console.log("Nice",result.data)

    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
  }
}
async saveRetryBillingDetails(req:Request,res:Response){
    try {
    const formData = req.body;
    console.log("Received  Retry billing details:", formData);

    const result = await this.userDetailsController.saveRetryBillingDetails2(formData);
  

    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
  }
}

async updateBookedEventPaymentStatus(req:Request,res:Response){
  try {
    console.log("Hello from controller");
    
    const bookedId=req.params.bookedId;
    console.log("Updating payment status of booked Event:", bookedId);

    const result = await this.userDetailsController.updatePaymentStatus(bookedId);
    if(result){
      console.log("Nice",result.data)

      res.status(HTTP_statusCode.OK).json(result); 
    }

  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}



async getExistingReviews(req: Request, res: Response): Promise<void> {
  try {
    const eventId=req.params.eventId;
    const userId=req.params.userId
    const savedEvent = await this.userProfileController.getExistingReviewDetails2(userId,eventId);
    if (savedEvent.success) {
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    return;
    }
     res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}


async getEventHistoryDetails(req: Request, res: Response): Promise<void> {
  try {

    const userId=req.params.userId;
    const savedEvent = await this.userProfileController.getEventHistoryDetails2(userId);
    if (savedEvent.success) {
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    return;
    }
     res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}

async getEventBookedDetails(req: Request, res: Response): Promise<void> {
  try {
    const userId=req.params.userId;
    const savedEvent = await this.userProfileController.getEventBookedDetails2(userId);
    if (savedEvent.success) {
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    return;
    }
     res.status(HTTP_statusCode.TaskFailed).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryD  etails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}






async getBookedManagerDetails(req:Request,res:Response):Promise<void>{
  try {
    console.log("Hello");
    
    const userId=req.query.name;
    console.log("Hello Moto",userId);
    const savedEvent = await this.userProfileController.getBookedManagerDetails2(userId as string);
    if (savedEvent.success) {
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    return;
    }
     res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}

async checkOfferAvailable(req:Request,res:Response){
  try {
    const categoryName=req.params.category;

    console.log("Chech the cat",categoryName);

    const savedEvent = await this.userController.checkOfferAvailableService(categoryName);
    if(savedEvent.success){
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
      return;
      }
       res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in check Offer Available:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
    
  }
}
async cancelBookingEvent(req:Request,res:Response){
  try {
    const bookedId=req.params.bookingId;
    const userId=req.params.userId;

    console.log("Check the bookedId",bookedId);

    const savedEvent = await this.cancelEventController.cancelEventBooking(bookedId,userId);
    if(savedEvent.result.success){
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
      return;
      }
       res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
  } catch (error) {
    console.error("Error in check cancel booking:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
    
  }
}
  async fetchUserWallet(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this.cancelEventController.fetchWalletOfUser(userId);
      if(savedEvent.result.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
    } catch (error) {
      console.error("Error in check User Wallet:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
      
    }

  }
  async fetchUserNotification(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this.notificationVideoCallCOntroller.fetchNotificationOfUser(userId);
      if(savedEvent.result.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
      
    }
  }
  async fetchNotificationCount(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this.notificationVideoCallCOntroller.NotificationCountOfUser(userId);
      if(savedEvent.result.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
      
    }

  }




async createChatSchema(req: Request, res: Response) {
  try {
    const formData = req.body;
    console.log("Received billing details:", formData);

    const result = await this.userProfileController.createChatSchema2(formData);
    console.log("Nice",result.data)

    res.status(HTTP_statusCode.OK).json(result); // Send response to client
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
  }
}




async uploadUserProfilePicture(req: Request, res: Response) {
  console.log("Received request for uploading profile");
  console.log(req.params, "Yeah", req.file);

  const userId = req.params.userId;
  const profilePicture = req.file; 

  if (!profilePicture) {
    console.log('Mahn');
    res.status(HTTP_statusCode.BadRequest).json({ error: response_message.UPLOADUSERPROFILEPICTURE_FAILED });
    return;
  }

  try {
    const result = await this.userProfileController.uploadUserProfileDetails2(userId, profilePicture);
    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.UPLOADUSERPROFILEPICTURE_ERROR});
  }
}


 }
  
  export default userlogin;
  


