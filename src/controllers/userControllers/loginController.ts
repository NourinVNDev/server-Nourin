import { Request,Response } from "express";
import HTTP_statusCode from "../../contants/enums";
import { inject, injectable } from "inversify";
import TYPES from "../../inversify/types";
import response_message from "../../contants/response_message";
import { IUserLoginService } from "../../interfaces/userInterfaces/serviceInterfaces/IUserLoginService";
import { generateAccessToken,generateRefreshToken } from "../../utils/authUtil";
import { UserPayload } from "../../dtos/user.dto";
import  jwt  from "jsonwebtoken";
let globalOTP: number | null = null;
const refreshTokens: string[] = [];
@injectable()
export class UserLoginController{
    constructor(
        @inject(TYPES.IUserLoginService) private _userLoginService:IUserLoginService
){
    console.log("_userLoginService injected:", !!_userLoginService); // should be true
  }


      async getAllEventData(req: Request, res: Response){
    try {
      
  if (!this._userLoginService) {
  throw new Error('UserLoginService not initialized');
}
      const result = await this._userLoginService.getAllEventService();
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

        const result = await this._userLoginService.loginDetails(formData);

        if (result?.success && result.user) {
         
            console.log("User",result.user.email)
            
            let user = { email: result.user.email, role: 'user' };

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            console.log("Generated Tokens:", { accessToken, refreshToken });

            refreshTokens.push(refreshToken);

            
          res.cookie('accessToken', accessToken, {
    httpOnly: true,  // Changed from false to true for security
    secure: true,    // Force HTTPS in production
    sameSite: 'none', // Keep this if you need cross-site cookies
    path: '/',
    maxAge: 2 * 60 * 1000, // 2 minutes
});

res.cookie('refreshToken', refreshToken, {
    httpOnly: true,  // Must be true for refresh tokens
    secure: true,
    sameSite: 'none',
    path: '/api/user/refresh-token', // Limit to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

        const otpNumber = await this._userLoginService.CheckingEmail(email);
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
    async verifyOTP(req: Request, res: Response): Promise<void> {
      try {
          const otp = req.body.otp;
          const formData = req.body;
          console.log("Received OTP:", otp, "Global OTP:", globalOTP);

          const result = await this._userLoginService.verifyService(formData, otp, globalOTP);

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
        const otpNumber = await this._userLoginService.CheckingEmailForResendOtp(email);
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
      
          const result=await this._userLoginService.GoogleAuth(data);
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
  
          const result = await this._userLoginService.forgotEmailDetails(email);
  
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
        let result=this._userLoginService.verifyForgotOtpService(otp,globalOTP);
        console.log("can",result);
        
        res.status(HTTP_statusCode.OK).json({ message: response_message.VERIFYFORGOTOTP_SUCCESS,data:(await result).message});
      } catch (error) {
          console.error("Error saving user data:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
      }

    }
      async getCategoryTypeDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const categoryName  =req.params.category;
      console.log('cat',categoryName);
        const result = await this._userLoginService.getCategoryTypeServiice(categoryName); // No res here, just the result

       
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
    async changeUserProfileDetails(req: Request, res: Response): Promise<void>{
    try {
      const formData=req.body;
    
  
     console.log("here",formData);
     
     const email=formData.email||formData.user.email;

     console.log(email);
     
    let result= this._userLoginService.changeUserProfileService(formData,email);
     res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error:response_message.CREATEADMINDATA_ERROR});
    }
}
 async setProfileDetails(req:Request,res:Response):Promise<void>{
    try {
      console.log("Findd",req.params);
      
      const {userId}  =req.params;
      console.log('mouse',userId);
        const result = await this._userLoginService.getUserProfileDetailsService(userId); // No res here, just the result

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
    async getAllCategoryDetails(req:Request,res:Response):Promise<void>{
    try {
 

        const result = await this._userLoginService.getWholeCategoryDetails(); // No res here, just the result

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

      async resetPassword(req: Request, res: Response): Promise<void>{
      try {
        const password=req.body.password;
        const password1=req.body.confirmPassword
       const formData={'password':password,'password1':password1};
       console.log("here",formData);
       
       const email=req.body.email;
       console.log(req.body);
       console.log(email);
       
      let result= this._userLoginService.resetPasswordDetails(formData,email);
       res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

      } catch (error) {
          res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
      }
  }

  async getAllEventDetails(req: Request, res: Response): Promise<void|any> {

  
  try {
      const result = await this._userLoginService.getAllEventService();
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
    async generateOtpForPassword(req: Request, res: Response): Promise<void>{

      
      try {
          const userId = req.params.userId;

          const otpNumber = await this._userLoginService.generateOtpService(userId);
      
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
      const result=this._userLoginService.verifyOtpCheckingService(otp,globalOTP);
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
     
    let result= this._userLoginService.resetPasswordDetails(formData,userId);
     res.status(HTTP_statusCode.OK).json({ message:response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});

    } catch (error) {
        res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
    }
}

async checkOfferAvailable(req:Request,res:Response){
  try {
    const categoryName=req.params.category;

    console.log("Chech the cat",categoryName);

    const savedEvent = await this._userLoginService.checkOfferAvailableService(categoryName);
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




}