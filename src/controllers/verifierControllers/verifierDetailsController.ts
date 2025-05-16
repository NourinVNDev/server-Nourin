import { IVerifierService } from "../../service/verifierServices/IVerifierService";
import { verifierDetailsService } from "../../service/verifierServices/verifierDetailsService";
import { Request, Response } from "express";
import HTTP_statusCode from "../../config/enum/enum";
import GenerateOTP from "../../config/nodemailer";
import { generateAccessToken, generateRefreshToken } from "../../config/authUtils";
interface VerifierPayload{
    email:string,
    role:string
}
import jwt from "jsonwebtoken";
export class VerifierDetailsController {
    private verifierController: IVerifierService;

    private globalOTP: string = '';

    constructor(verifierServiceInstance: verifierDetailsService) {
        this.verifierController = verifierServiceInstance;
    }



    async checkVerifierHaveAccount(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            console.log("Manager Email:", email);

            const result = await this.verifierController.checkIfVerifierActive(email);

            console.log("Manager status result:", result);

            if (result.success) {
                this.globalOTP = Math.floor(100000 + Math.random() * 900000).toString();
                console.log("Global OTP:", this.globalOTP)
                // Send OTP via email
                await GenerateOTP(email, this.globalOTP);

                res.status(HTTP_statusCode.OK).json(result);

            } else {
                res.status(HTTP_statusCode.NotFound).json(result);
            }
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }
    async sendResendOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            console.log("Manager Email:", email);
            this.globalOTP = Math.floor(100000 + Math.random() * 900000).toString();
            console.log("Global OTP:", this.globalOTP)
            // Send OTP via email
            await GenerateOTP(email, this.globalOTP);

            res.status(HTTP_statusCode.OK).json({ success: true, message: 'Resend the OTP again!!' });

        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }
    async verifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { enteredOtp,email } = req.params;
            console.log("Enter OTP:", enteredOtp);
            if(this.globalOTP===enteredOtp){
                 
            const verifier={email:email,role:'verifier'};
            const verifierAccessToken=generateAccessToken(verifier);
            const  verifierRefreshToken=generateRefreshToken(verifier);
            res.cookie('accessToken', verifierAccessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 2 * 60 * 1000
            });

            res.cookie('refreshToken', verifierRefreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
                res.status(HTTP_statusCode.OK).json({ success: true, message: 'Your OTP is Correct' });
            }else{
                res.json({ success: false, message: 'Your OTP is not correct'});
            }
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                error: 'Something went wrong'
            });
        }

    }
    async postVerifierLogin(req: Request, res: Response): Promise<void> {
        try {
            const formData = req.body;
            console.log("Form Input Data", formData);
    
            const result = await this.verifierController.verifierLoginDetails(formData);
    

         
            res.status(200).json(result);

        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }
    async getAllCompanyEvents(req:Request,res:Response):Promise<void>{
        try {
            const email = req.params.email;
            console.log("your Email:", email);
    
            const result = await this.verifierController.fetchAllEvents(email);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }
    async reGenerateVerifierAccessToken(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
      console.log("Refresh Token",refreshToken);
        if (!refreshToken) {
          console.log("snake");
          
          res.status(HTTP_statusCode.NotFound).json({
            success: false,
            message: "Verifier Refresh token not provided",
          });
          return;
        }
      
        try {
         
          const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
          console.log("From Process",refreshTokenSecret);
          if (!refreshTokenSecret) {
            res.status(HTTP_statusCode.InternalServerError).json({
              success: false,
              message: " Manager Refresh token secret not defined in environment variables",
            });
            return;
          }
      
       
          const verifier = jwt.verify(refreshToken, refreshTokenSecret) as VerifierPayload;
          console.log("Again Checking",verifier);
          // Ensure the email exists in the decoded token
          if (!verifier.email) {
            res.status(HTTP_statusCode.NotFound).json({
              success: false,
              message: "Invalid refresh token: Verifier email not found",
            });
            return; // End the execution
          }
      
          // Generate a new access token
          const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
          if (!accessTokenSecret) {
            res.status(HTTP_statusCode.InternalServerError).json({
              success: false,
              message: " Manager Access token secret not defined in environment variables",
            });
            return; // End the execution
          }
      
          const verifierAccessToken = jwt.sign(
            { email: verifier.email,role:verifier.role},
            accessTokenSecret,
            { expiresIn: "15m" }
          );
          res.cookie('accessToken', verifierAccessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge:2*60*1000
        });
      
          res.status(HTTP_statusCode.OK).json({
            success: true,
            message: "Manager Access token regenerated successfully",
            verifierAccessToken: verifierAccessToken,
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


    async getBookedDetails(req:Request,res:Response):Promise<void>{
        try {
            const eventId = req.params.eventId;
            console.log("EventId:", eventId);
    
            const result = await this.verifierController.fetchAllBookingDetails(eventId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        }
    }

    async getSingleUserData(req:Request,res:Response){
           try {
            const bookedID= req.params.bookedId;
            const userName=req.params.userName;
    
            const result = await this.verifierController.fetchSingleUserDetails(bookedID,userName);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        }

    }

    async markUserEntry(req:Request,res:Response):Promise<void>{
        try {
            const bookingId = req.params.bookedId;
            console.log("bookedID:", bookingId);
            const userName=req.params.userName;
    
            const result = await this.verifierController.markUserEntryService(bookingId,userName);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
        } 
    }
    
}
