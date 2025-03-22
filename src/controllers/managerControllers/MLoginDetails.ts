import { Request,Response } from "express";
import {mLoginService} from "../../service/managerService/MloginService";
let globalOTP: number | null = null;
import { managerEventControllers } from "./managerEventController";
import { generateAccessToken,generateRefreshToken} from "../../config/authUtils";
import { managerOfferControllers } from "./managerOfferController";
import { managerBookingDetailsControllers } from "./bookingDetailsController";
import jwt from 'jsonwebtoken';
import FormData from "form-data";
import { IMloginService } from "../../service/managerService/IMloginService";
import { loginServices } from "../../service/userService/loginService";
import HTTP_statusCode from "../../config/enum/enum";
import { managerVerifierDetailsControllers } from "./verifierDetailsController";
interface ManagerPayload {
  email: string;
  role:string
}


export class managerLogin{
    private managerController:IMloginService;
    private eventController:managerEventControllers;
    private offerController:managerOfferControllers;
    private bookingController:managerBookingDetailsControllers;
    private verifierController:managerVerifierDetailsControllers;
    constructor(managerServiceInstance:mLoginService){
        this.managerController=managerServiceInstance;
        this.eventController=new managerEventControllers(managerServiceInstance);
        this.offerController=new managerOfferControllers(managerServiceInstance);
        this.bookingController=new managerBookingDetailsControllers(managerServiceInstance);
        this.verifierController=new managerVerifierDetailsControllers(managerServiceInstance);
    }
   async  managerRegister(req:Request,res:Response):Promise<void>{
        console.log('Hai');
        
        try {
            const email = req.body.email;
            console.log('hello', email);

            const otpNumber = await this.managerController.CheckingEmail(email);
        
            if (typeof otpNumber === 'string') {
              globalOTP = parseInt(otpNumber, 10); // Convert string to number
          } else if (typeof otpNumber === 'boolean') {
              // Handle the case where otpNumber is a boolean
              console.error("Received a boolean value instead of a number:", otpNumber);
              res.status(HTTP_statusCode.BadRequest).json({ error: 'Failed to generate OTP.' });
              return;
          } else {
              globalOTP = otpNumber; // If it's already a number
          }
          console.log("Hash",globalOTP);
          

            res.status(HTTP_statusCode.OK).json({ message: 'OTP sent', otpData: otpNumber });
        } catch (error) {
            console.error("Error saving user data:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
        }

    }
    async managerVerifyOtp(req:Request,res:Response):Promise<void>{
        try{
            const otp = req.body.otp;
            const formData = req.body;
            console.log(req.body);
            console.log(formData);
    
            console.log("Received OTP:", otp, "Global OTP:", globalOTP);
            const result=this.managerController.MverifyService(formData,otp,globalOTP);
            if((await result).success){
              res.status(HTTP_statusCode.OK).json({ message:'Otp is Matched' });
            }else{
              console.log("South");
              
              res.status(HTTP_statusCode.BadRequest).json({message:'Otp  is not Matched'});
            }
           
          } catch (error) {
              console.error("Error saving user data:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
          }

    }
        async managerLogin(req: Request, res: Response): Promise<void|any>{
            try {
                const formData = req.body;
                console.log('Received login data:', formData);
        
                // Get login result
                const result = await this.managerController.mloginDetails(formData);
                if (!result || !result.user || !result.user.user) {
                    return res.status(HTTP_statusCode.BadRequest).json({ error: 'Invalid login credentials' });
                }
                const userData = result.user.user;
        
                let manager={email:userData.email,role:'manager'};
                const accessToken = generateAccessToken(manager);
                const refreshToken = generateRefreshToken(manager);
                console.log("Tokens",accessToken,refreshToken);
                 // Set cookies securely
            res.cookie('managerToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });

            res.cookie('managerRefreshToken', refreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
                // Send success response
                res.status(HTTP_statusCode.OK).json({ message: 'Login Success', data: (await result).user });
            
            } catch (error) {
                console.error('Login error:', error);
                res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
            }
        }
    
        async managerForgotPassword(req: Request, res: Response): Promise<void>{
            console.log("Hello");
            
            try {

             const email=req.body;
             console.log(email);
            let result= this.managerController.managerForgotEmail(email);
            globalOTP=Number((await result).otpValue);
             res.status(HTTP_statusCode.OK).json({ message: 'OTP Success' ,data:(await result).otpValue});
    
            } catch (error) {
                res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
            }
        }

        async managerVerifyOtpForForgot(req:Request,res:Response):Promise<void>{
            try{
                const otp = req.body.otp;
                const email = req.body.email;
                console.log(req.body);
               
        
                console.log("Received OTP:", otp, "Global OTP:", globalOTP);
                this.managerController.verifyOtpForForgot(email,otp,globalOTP);
                res.status(HTTP_statusCode.OK).json({ message: 'OTP Matched' });
              } catch (error) {
                  console.error("Error saving user data:", error);
                  res.status(HTTP_statusCode.InternalServerError).json({ error: 'Failed to save user data in session' });
              }
    
        }
        
        async managerResetPassword(req: Request, res: Response): Promise<void>{
            try {
              const password=req.body.password;
              const password1=req.body.confirmPassword
           
            
        
             
             const email=req.body.email;
             console.log(req.body);
             console.log(email);
             
            let result= this.managerController.resetPasswordDetailsForManager(email,password,password1);
             res.status(HTTP_statusCode.OK).json({ message: 'password Reset Success' ,data:(await result).user});
      
            } catch (error) {
                res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
            }
        }



          async reGenerateManagerAccessToken(req: Request, res: Response): Promise<void> {
            const refreshToken = req.cookies.managerRefreshToken; // Read refresh token from cookies
          console.log("Refresh Token",refreshToken);
            if (!refreshToken) {
              console.log("snake");
              
              res.status(HTTP_statusCode.NotFound).json({
                success: false,
                message: " Manager Refresh token not provided",
              });
              return;
            }
          
            try {
              // Ensure the REFRESH_TOKEN_SECRET is available
              const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
              console.log("From Process",refreshTokenSecret);
              if (!refreshTokenSecret) {
                res.status(HTTP_statusCode.InternalServerError).json({
                  success: false,
                  message: " Manager Refresh token secret not defined in environment variables",
                });
                return; // End the execution
              }
          
              // Verify the refresh token and decode the payload
              const manager = jwt.verify(refreshToken, refreshTokenSecret) as ManagerPayload;
              console.log("Again Checking",manager);
              // Ensure the email exists in the decoded token
              if (!manager.email) {
                res.status(HTTP_statusCode.NotFound).json({
                  success: false,
                  message: "Invalid refresh token: Manager email not found",
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
          
              const managerToken = jwt.sign(
                { email: manager.email,role:manager.role},
                accessTokenSecret,
                { expiresIn: "15m" }
              );
              res.cookie('managerToken', managerToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge:2*60*1000
            });
          
              res.status(HTTP_statusCode.OK).json({
                success: true,
                message: "Manager Access token regenerated successfully",
                accessToken: managerToken,
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

        async createEventPost(req: Request, res: Response): Promise<void> {
            console.log("Received request for creating an event");
            console.log(req.body,"Yeah",req.file);
    
            try {
                // Ensure a file is uploaded
                if (!req.file) {
                    console.log('Mahn')
                    res.status(HTTP_statusCode.BadRequest).json({ error: "No file uploaded. Please upload an image." });
                    return;
                }
    
                // Delegate to manager-specific controller

                const savedEvent = await this.eventController.createEventPost(req, res);
                if(savedEvent.success){
                  res.status(HTTP_statusCode.OK).json({
                    message: "Event data saved successfully",
                    data: savedEvent.data,
                });
                }else{
                  res.json({message:"Duplicate Event Name",data:null}
                  )
                }
    
              
            } catch (error) {
                console.error("Error in createEventPost:", error);
                res.status(HTTP_statusCode.InternalServerError).json({ error: "Failed to create event. Please try again." });
            }
        }
        async createEventSeatDetails(req:Request,res:Response):Promise<void>{
        
          console.log(req.body,"yes",req.params);
  
          try {
            

              const savedEvent = await this.eventController.createEventSeatTypeDetails(req, res);
              if(savedEvent.success){
                res.status(HTTP_statusCode.OK).json({
                  message: "Event data saved successfully",
                  data: savedEvent.data,
              });
              }else{
                res.json({message:"Duplicate Event Name",data:null}
                )
              }
  
            
          } catch (error) {
              console.error("Error in createEventPost:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error: "Failed to create event. Please try again." });
          }

        }

        async updateEventPost(req: Request, res: Response): Promise<void> {
          console.log("Received request for updating  an event");
          console.log(req.body,"Yeah",req.files);
          try {
                // Ensure a file is uploaded
            
          
  
              // Delegate to manager-specific controller

              const savedEvent = await this.eventController.updateEventPost(req, res);
              if(savedEvent.success){
                res.status(HTTP_statusCode.OK).json({
                  message: "Event data updated saved successfully",
                  data: savedEvent.data,
              });
              }else{
                res.json({message:"Duplicate Event Name",data:null}
                )
              }
  
            
          } catch (error) {
              console.error("Error in createEventPost:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error: "Failed to create event. Please try again." });
          }
      }

      async getManagerProfileDetails(req: Request, res: Response): Promise<void|any> {
        try {
          console.log("Req.params",req.params);
          
          const {companyName}=req.params;
          console.log("CompnayName",companyName);
            const result = await this.managerController.getManagerProfileService(companyName); // No res here, just the result
    
            // Check if the result is successful or not
            if (!result.success) {
                return res.status(HTTP_statusCode.InternalServerError).json({
                    message: result.message
                });
            }
    
            res.status(HTTP_statusCode.OK).json({
                message: "Event data fetched successfully",
                data: result.data
            });
    
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
        }
    }

    async updateManagerProfile(req: Request, res: Response): Promise<void|any> {
      try {
        console.log("Req.params",req.params);
        
        const {phone,email}=req.body;
        console.log("Manager Details",email,phone);
        const formData={
          email:email,
          phoneNo:phone
        }
          const result = await this.managerController.updateManagerProfileService(formData); // No res here, just the result
  
          // Check if the result is successful or not
          if (!result.success) {
              return res.status(HTTP_statusCode.InternalServerError).json({
                  message: result.message
              });
          }
  
          res.status(HTTP_statusCode.OK).json({
              message: "Event data fetched successfully",
              data: result.data
          });
  
      } catch (error) {
          console.error("Error in getCategoryDetails:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
      }
  }



  async updateManagerPassword(req: Request, res: Response): Promise<void|any> {
    try {
   
      
      const {newPassword,email}=req.body;
      console.log("Manager Details",email,newPassword);
      const formData={
        email:email,
        newPassword:newPassword
      }
        const result = await this.managerController.updateManagerPasswordService(formData); // No res here, just the result

        // Check if the result is successful or not
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: "Manager Password updated successfully",
            data: result.data
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
    }
}
   async getEventTypeData(req: Request, res: Response): Promise<void|any> {
            try {
                const result = await this.managerController.getEventTypeDataService(req); // No res here, just the result
        
                // Check if the result is successful or not
                if (!result.success) {
                    return res.status(HTTP_statusCode.InternalServerError).json({
                        message: result.message
                    });
                }
        
                res.status(HTTP_statusCode.OK).json({
                    message: "Event data fetched successfully",
                    data: result.data
                });
        
            } catch (error) {
                console.error("Error in getCategoryDetails:", error);
                res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
            }
        }

        async getAllOffers(req: Request, res: Response): Promise<void> {
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
              const result = await this.offerController.getAllOffers(req,res);
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Offers fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }

          async getSearchOfferUserInput(req:Request,res:Response):Promise<void>{
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
              const result = await this.offerController.getSearchOfferInput(req,res);
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              console.log("Result Data:",result);
              res.status(HTTP_statusCode.OK).json({
                message: "Offers fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }

            

          }
          async createNewOffer(req: Request, res: Response): Promise<void> {
            try {
              // Extract formData from req.body
              console.log(req.body);
              const  formData  = req.body;
              console.log("FormData from Offer", formData);
              const result = await this.offerController.createNewOfferController(formData);
          
              // Check if the result indicates a failure
              if (!result?.success) {
                console.log('hai');
                
                res.status(HTTP_statusCode.OK).json({
                  message: result?.message || "Failed to fetch offers",
                });
                return;
              }
          
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Offers fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async updateOfferDetails(req: Request, res: Response): Promise<void> {
            try {
              // Extract formData from req.body
              console.log("Finding....")
              console.log(req.body);
              const formData= req.body;
              console.log("FormData from Offer", formData);
              const result = await this.offerController.updateOfferController(formData);
          
              // Check if the result indicates a failure
              if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
                return;
              }
          
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Offers Updated successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }




          async getSelectedOfferDetails(req: Request, res: Response): Promise<void> {
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
              const {offerId}=req.params;
              const result = await this.offerController.getSelectedOfferDataService(offerId);
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Offer fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          

          
          
          async getAllEventDetails(req: Request, res: Response): Promise<void> {
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
              const result = await this.eventController.getAllEventData(req,res);
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Event fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async getSelectedEventDetails(req: Request, res: Response): Promise<void> {
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
              const {id}=req.params;
              const result = await this.eventController.getSelectedEventDataService(id);
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: "Event fetched successfully",
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }  

          async getTodaysBookingDetails(req:Request,res:Response):Promise<void>{
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
            
              const result = await this.bookingController.getTodaysBookingDetails2();
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: result.data.message,
                data: result.data.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async getTotalBookingDetails(req:Request,res:Response):Promise<void>{
            try {
              // Call the controller method with only the necessary data (e.g., req.params, req.query, etc.)
            
              const result = await this.bookingController.getTotalBookingDetails2();
        
              // Check if the result indicates a failure
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch offers",
                });
              }
        
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: result.data.message,
                data: result.data.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async getBookedUserDetails(req:Request,res:Response){
            try {
              const managerName=req.params.managerName;
              console.log("ManagerName",managerName);
              const savedEvent = await this.bookingController.getBookedUserDetails2(managerName);
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

           async createChatSchema(req: Request, res: Response) {
            try {
              const formData = req.body;
              console.log("Received billing details:", formData);
          
              const result = await this.bookingController.createChatSchema2(formData);
              console.log("Nice",result.data)
          
              res.status(HTTP_statusCode.OK).json(result); // Send response to client
            } catch (error) {
              console.error("Error in saveBillingDetails:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
            }
          }

          async getAllVerifiers(req:Request,res:Response){
            try {
              const formData = req.body;
              console.log("Received billing details:", formData);
          
              const result = await this.verifierController.getAllVerifierDetails();
              console.log("Nice",result.data)
          
              res.status(HTTP_statusCode.OK).json(result); // Send response to client
            } catch (error) {
              console.error("Error in saveBillingDetails:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
            }

          }
          async updateVerifierStatus(req:Request,res:Response){
            try {
              const {verifierId}=req.params;
              console.log("Received VerifierID:", verifierId);
          
              const result = await this.verifierController.updateVerifierStatusController(verifierId);
              console.log("Nice",result.data)
          
              res.status(HTTP_statusCode.OK).json(result); // Send response to client
            } catch (error) {
              console.error("Error in saveBillingDetails:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: "Internal Server Error" });
            }
          }
    }

       


    

