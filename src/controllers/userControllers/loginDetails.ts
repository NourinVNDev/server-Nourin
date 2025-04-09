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
  private cancelEventController:CancelBookedEventController
  constructor(userServiceInstance:loginServices){
    this.userController=userServiceInstance;
    this.userDetailsController=new userDetailsController(userServiceInstance);
    this.userProfileController=new userProfileController(userServiceInstance);
    this.cancelEventController=new CancelBookedEventController(userServiceInstance)
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
        message: "An error occurred while fetching events",
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
                message: 'Login Successful',
                data: result.user, 
                categoryNames:result.categoryName
            });
        } else {
            res.status(HTTP_statusCode.Unauthorized).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
    } catch (error: any) {
        console.error("Error in loginDetails:", error.message || error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: 'Internal Server Error' });
    }
}


    async postUserDetails(req: Request, res: Response): Promise<void>{
        console.log("hai");
        
        try {
            const email = req.body.email;
            console.log('hello', email);

            const otpNumber = await this.userController.CheckingEmail(email);
        
             if (typeof otpNumber.success === 'boolean') {
              // Handle the case where otpNumber is a boolean
              console.error("Received a boolean value instead of a number:", otpNumber);
              res.status(HTTP_statusCode.BadRequest).json({ error: 'Failed to generate OTP.' });
              return;
          } else if(typeof otpNumber.success==='number') {
            console.log("check otp",globalOTP);
            
              globalOTP = otpNumber.success; // If it's already a number
          }
          console.log('Checking',otpNumber);
          console.log("Hash",globalOTP);
          

            res.status(HTTP_statusCode.OK).json({ message: 'OTP sent', otpData: otpNumber });
        } catch (error) {
            console.error("Error saving user data:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session'});
        }
    }
    async generateOtpForPassword(req: Request, res: Response): Promise<void>{
      console.log("hai");
      
      try {
          const userId = req.params.userId;
          console.log('hello', userId);

          const otpNumber = await this.userController.generateOtpService(userId);
      
           if (typeof otpNumber.success === 'boolean') {
            // Handle the case where otpNumber is a boolean
            console.error("Received a boolean value instead of a number:", otpNumber);
            res.status(HTTP_statusCode.BadRequest).json({ error: 'Failed to generate OTP.' });
            return;
        } else if(typeof otpNumber.success==='number') {
          console.log("check otp",globalOTP);
          
            globalOTP = otpNumber.success; // If it's already a number
        }
        console.log('Checking',otpNumber);
        console.log("Hash",globalOTP);
        

          res.status(HTTP_statusCode.OK).json({ message: 'OTP sent', otpData: otpNumber });
      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
      }
  }

  async verifyOtpForPassword(req: Request, res: Response): Promise<void>{
    try{
      
      const {otp} = req.body;
      console.log("Check the Otp",otp);
      console.log("Received OTP:", otp, "Global OTP:", globalOTP);
      const result=this.userController.verifyOtpCheckingService(otp,globalOTP);
      if((await result).success){
        res.status(HTTP_statusCode.OK).json({ message: 'Otp are matched' });
      }else{
        res.status(HTTP_statusCode.BadRequest).json({ message: 'Otp are not matched' });
      }
    
    } catch (error) {
        console.error("Error saving user data:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
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
            res.status(HTTP_statusCode.NotFound).json({
              success: result.success,
              message: result.message,
              data: result.user
          });
          }

        

      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
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
          res.status(HTTP_statusCode.BadRequest).json({ error: 'Failed to generate OTP.' });
          return;
      } else if(typeof otpNumber.success==='number') {
        console.log("check otp",globalOTP);
        
          globalOTP = otpNumber?.success; // If it's already a number
      }
      console.log("Hashing",globalOTP);
      

        res.status(HTTP_statusCode.OK).json({ message: 'OTP sent', otpData: otpNumber });
        
      } catch (error) {
        console.error("Error saving user data:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
    }
    }
     async googleAuth(req: Request, res: Response): Promise<void>{
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

            res.status(HTTP_statusCode.OK).json({ message: 'Login Successful',data:result.user });
          } else {
            res.status(HTTP_statusCode.Unauthorized).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
      
        

      
        } catch (error) {
          console.error('Error saving user data:', error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
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
              res.status(HTTP_statusCode.OK).json({ message: 'OTP Success', data: result.otpValue });
          } else {
              // Handle the case where success is false
              res.status(HTTP_statusCode.BadRequest).json({ message: result.message });
          }
      } catch (error) {
          console.error("Error in forgotPassword:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
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
        
        res.status(HTTP_statusCode.OK).json({ message: 'Forgot otp is matched Perfectly',data:(await result).message});
      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
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
       res.status(HTTP_statusCode.OK).json({ message: 'password Reset Success' ,data:(await result).user});

      } catch (error) {
          res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
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
     res.status(HTTP_statusCode.OK).json({ message: 'password Reset Success' ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
    }
}


  

  
  async changeUserProfileDetails(req: Request, res: Response): Promise<void>{
    try {
      const formData=req.body;
    
  
     console.log("here",formData);
     
     const email=formData.email||formData.user.email;

     console.log(email);
     
    let result= this.userController.changeUserProfileService(formData,email);
     res.status(HTTP_statusCode.OK).json({ message: 'password Reset Success' ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
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
            message: "Event data fetched successfully",
            data: result.user.category
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
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
            message: "Event data fetched successfully",
            data: result.user
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
    }

  }

  async reGenerateAccessToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
  console.log("Refresh Token",refreshToken);
    if (!refreshToken) {
      console.log("snake");
      
      res.status(HTTP_statusCode.NotFound).json({
        success: false,
        message: "Refresh token not provided",
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
          message: "Access token secret not defined in environment variables",
        });
        return; // End the execution
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
      return; // End the execution
    } catch (error) {
      console.error("Error verifying refresh token:", error);
      res.status(HTTP_statusCode.Unauthorized).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return; // End the execution
    }
  }

    async getAnEventDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const postId  =req.params.postId;
      console.log('cat',postId);
        const result = await this.userController.getCategoryBasedServiice(postId);
        console.log("Result",result);

        // Check if the result is successful or not
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: "Event data fetched successfully",
            data: result  
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
    }
}


async getAllEventDetails(req: Request, res: Response): Promise<void|any> {
  console.log("Blank");
  
  try {
      const result = await this.userController.getAllEventServiice();
      console.log("Result",result);

      // Check if the result is successful or not
      if (!result.success) {
          return res.status(HTTP_statusCode.InternalServerError).json({
              message: result.message
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: "Event data fetched successfully",
          data: result  
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
  }
}




  

  async getCategoryTypeDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const categoryName  =req.params.category;
      console.log('cat',categoryName);
        const result = await this.userController.getCategoryTypeServiice(categoryName); // No res here, just the result

        // Check if the result is successful or not
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: "Event data fetched successfully",
            data: result.user
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
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
              message:'Something went wrong'
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: "User likes successfully",
          data: {result}
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
  }
}

async getPostDetails(req:Request,res:Response){
  try {
    const postId=req.params.postId;
      const result = await this.userDetailsController.handlePostDetails(postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:'Something went wrong'
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: "Retrive Post Data successfully",
          data: result
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
  }


}

async getSelectedEventDetails(req:Request,res:Response){
  try {
    const postId=req.params.id;
      const result = await this.userDetailsController.getSelectEventController(postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:'Something went wrong'
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: "Retrive Post Data successfully",
          data: result
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
  }


}
async makePaymentStripe(req: Request, res: Response): Promise<void> {
  try {
    const { products } = req.body;
    const result = await this.userDetailsController.makePaymentStripeController(products);

    if (!result) {
      res.status(HTTP_statusCode.InternalServerError).json({
        message: 'Something went wrong'
      });
      return; // Prevents further execution
    }

    console.log("Checking server-side 1st", result);
    if (!result.result.success) {
      res.status(HTTP_statusCode.OK).json({
        message: result.result.message,
        success:true
      });
      return;
    }

    console.log("Checking server-side", result);

    res.status(HTTP_statusCode.OK).json({
      message: "Retrieve Post Data successfully",
      sessionId: result.result.data,
      success:true
    });
    return;

  } catch (error) {
    console.error("Error in getCategoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ 
      message: "Internal server error", 
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
    res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
}


}


async saveBillingDetails(req: Request, res: Response) {
  try {
    const formData = req.body;
    console.log("Received billing details:", formData);

    const result = await this.userDetailsController.saveBillingDetails2(formData);
    console.log("Nice",result.data)

    res.status(HTTP_statusCode.OK).json(result); // Send response to client
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
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
     res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
  }
}






async getBookedManagerDetails(req:Request,res:Response):Promise<void>{
  try {
    const userId=req.params.userId;
    console.log("Hello Moto",userId);
    const savedEvent = await this.userProfileController.getBookedManagerDetails2(userId);
    if (savedEvent.success) {
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    return;
    }
     res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in getEventHistoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
    
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
    
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
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
      
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
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
  }
}




async uploadUserProfilePicture(req: Request, res: Response) {
  console.log("Received request for uploading profile");
  console.log(req.params, "Yeah", req.file);

  const userId = req.params.userId;
  const profilePicture = req.file; 

  if (!profilePicture) {
    console.log('Mahn');
    res.status(HTTP_statusCode.BadRequest).json({ error: "No file uploaded. Please upload an image." });
    return;
  }

  try {
    const result = await this.userProfileController.uploadUserProfileDetails2(userId, profilePicture);
    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    res.status(HTTP_statusCode.InternalServerError).json({ error: "Failed to upload profile picture." });
  }
}


 }
  
  export default userlogin;
  


