import { Request,response,Response } from "express";
import {mLoginService} from "../../service/managerService/MloginService";
let globalOTP: number | null = null;
import { managerEventControllers } from "./managerEventController";
import { generateAccessToken,generateRefreshToken} from "../../config/authUtils";
import { managerOfferControllers } from "./managerOfferController";
import { managerBookingDetailsControllers } from "./bookingDetailsController";
import jwt from 'jsonwebtoken';
import { IMloginService } from "../../service/managerService/IMloginService";
import HTTP_statusCode from "../../config/enum/enum";
import { managerVerifierDetailsControllers } from "./verifierDetailsController";
import response_message from "../../config/enum/response_message";
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
              res.status(HTTP_statusCode.BadRequest).json({ error: response_message.MANAGERREGISTER_FAILED });
              return;
          } else {
              globalOTP = otpNumber; // If it's already a number
          }
          console.log("Hash",globalOTP);
          

            res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERREGISTER_SUCCESS, otpData: otpNumber });
        } catch (error) {
            console.error("Error saving user data:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
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
              res.status(HTTP_statusCode.OK).json({ message:response_message.MANAGERVERIFYOTP_SUCCESS });
            }else{
              console.log("South");
              
              res.status(HTTP_statusCode.BadRequest).json({message:response_message.MANAGERVERIFYOTP_FAILED});
            }
           
          } catch (error) {
              console.error("Error saving user data:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERVERIFYOTP_ERROR});
          }

    }
        async managerLogin(req: Request, res: Response): Promise<void|any>{
            try {
                const formData = req.body;
                console.log('Received login data:', formData);
        
                // Get login result
                const result = await this.managerController.mloginDetails(formData);
                console.log("Result  of Login",result);
                
                if (!result || !result.user) {
                    return res.status(HTTP_statusCode.OK).json({ message: response_message.CREATEADMINDATA_FAILED});
                }
                const userData = result.user;
        
                let manager={email:userData.email,role:'manager'};
                const accessToken = generateAccessToken(manager);
                const refreshToken = generateRefreshToken(manager);
                console.log("Tokens",accessToken,refreshToken);
             
            res.cookie('accessToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
          
                res.status(HTTP_statusCode.OK).json({ message:response_message.ADMINLOGIN_SUCCESS, data: (await result).user });
            
            } catch (error) {
                console.error('Login error:', error);
                res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
            }
        }
    
        async managerForgotPassword(req: Request, res: Response): Promise<void>{
            console.log("Hello");
            
            try {

             const email=req.body.email;
             console.log(email);
            let result= this.managerController.managerForgotEmail(email);
            if((await result).success){
              globalOTP=Number((await result).otpValue);
              res.status(HTTP_statusCode.OK).json({ message: (await result).message ,data:(await result).otpValue});
            }else{
              res.status(HTTP_statusCode.OK).json({ message: (await result).message ,data:(await result).otpValue});
            }

    
            } catch (error) {
                res.status(HTTP_statusCode.InternalServerError).json({ error:response_message.ADMINLOGIN_ERROR });
            }
        }

        async managerVerifyOtpForForgot(req:Request,res:Response):Promise<void>{
            try{
                const otp = req.body.otp;
                const email = req.body.email;
                console.log(req.body);
               
        
                console.log("Received OTP:", otp, "Global OTP:", globalOTP);
                const result=this.managerController.verifyOtpForForgot(email,otp,globalOTP);
                if((await result).success){
                  res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERVERIFYOTPFORFORGOT_SUCCESS});
                }else{
                  res.status(HTTP_statusCode.OK).json({message:(await result).message});
                }

              } catch (error) {
                  console.error("Error saving user data:", error);
                  res.status(HTTP_statusCode.InternalServerError).json({ error:response_message.MANAGERVERIFYOTP_ERROR });
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
             res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS ,data:(await result).user});
      
            } catch (error) {
                res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.ADMINLOGIN_ERROR});
            }
        }



          async reGenerateManagerAccessToken(req: Request, res: Response): Promise<void> {
            const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
          console.log("Refresh Token",refreshToken);
            if (!refreshToken) {
              console.log("snake");
              
              res.status(HTTP_statusCode.NotFound).json({
                success: false,
                message: response_message.REGENERATEMANAGERACCESSTOKEN_FAILED,
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
                  message:response_message.REGENERATEMANAGERACCESSTOKEN_ERROR,
                });
                return; // End the execution
              }
          
              const managerToken = jwt.sign(
                { email: manager.email,role:manager.role},
                accessTokenSecret,
                { expiresIn: "15m" }
              );
              res.cookie('accessToken', managerToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge:2*60*1000
            });
          
              res.status(HTTP_statusCode.OK).json({
                success: true,
                message:response_message.REGENERATEMANAGERACCESSTOKEN_SUCCESS,
                accessToken: managerToken,
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

        async createEventPost(req: Request, res: Response): Promise<void> {
            console.log("Received request for creating an event");
            console.log(req.body,"Yeah",req.file);
    
            try {
                if (!req.file) {
                    console.log('Mahn')
                    res.status(HTTP_statusCode.BadRequest).json({ error: response_message.CREATEEVENTPOSTIMAGE_FAILED });
                    return;
                }

                const savedEvent = await this.eventController.createEventPost(req, res);
                if(savedEvent.success){
                  res.status(HTTP_statusCode.OK).json({
                    message:response_message.CREATEEVENTPOST_SUCCESS,
                    data: savedEvent.data,
                });
                }else{
                  res.json({message:response_message.CREATEEVENTPOST_FAILED,data:null}
                  )
                }
    
              
            } catch (error) {
                console.error("Error in createEventPost:", error);
                res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEEVENTPOST_ERROR });
            }
        }
        async createEventSeatDetails(req:Request,res:Response):Promise<void>{
        
          console.log(req.body,"yes",req.params);
  
          try {
            

              const savedEvent = await this.eventController.createEventSeatTypeDetails(req, res);
              if(savedEvent.success){
                res.status(HTTP_statusCode.OK).json({
                  message:response_message.GETCATEGORYDETAILS_SUCCESS,
                  data: savedEvent.data,
              });
              }else{
                res.json({message:response_message.CREATEEVENTPOST_FAILED,data:null}
                )
              }
  
            
          } catch (error) {
              console.error("Error in createEventPost:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEEVENTPOST_ERROR});
          }

        }

        async updateEventPost(req: Request, res: Response): Promise<void> {
          console.log("Received request for updating  an event");
          console.log(req.body,"Yeah",req.files);
          try {
               

              const savedEvent = await this.eventController.updateEventPost(req, res);
              if(savedEvent.success){
                res.status(HTTP_statusCode.OK).json({
                  message: response_message.UPDATEEVENTPOST_SUCCESS,
                  data: savedEvent.data,
              });
              }else{
                res.json({message:response_message.CREATEEVENTPOST_FAILED,data:null}
                )
              }
  
            
          } catch (error) {
              console.error("Error in createEventPost:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ error:response_message.CREATEEVENTPOST_ERROR});
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
                message:response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
                data: result.data
            });
    
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
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
              message:response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
              data: result.data
          });
  
      } catch (error) {
          console.error("Error in getCategoryDetails:", error);
          res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
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
            message:response_message.UPDATEMANAGERPASSWORD_SUCCESS,
            data: result.data
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
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
                    message:response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
                    data: result.data
                });
        
            } catch (error) {
                console.error("Error in getCategoryDetails:", error);
                res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
            }
        }

        async getAllOffers(req: Request, res: Response): Promise<void> {
            try {
              const managerId=req.params.managerId;
              const result = await this.offerController.getAllOffers(managerId);
        
           
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message ||response_message.GETALLOFFERS_FAILED,
                });
              }
        
          
              res.status(HTTP_statusCode.OK).json({
                message:response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message:response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }

          async getSearchOfferUserInput(req:Request,res:Response):Promise<void>{
            try {

              const result = await this.offerController.getSearchOfferInput(req,res);
        
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
              console.log("Result Data:",result);
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }

            

          }
          async createNewOffer(req: Request, res: Response): Promise<void> {
            try {
            
              console.log(req.body);
              const  formData  = req.body;
              console.log("FormData from Offer", formData);
              const result = await this.offerController.createNewOfferController(formData);
              if (!result?.success) {
                console.log('hai');
                
                res.status(HTTP_statusCode.OK).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
                return;
              }
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async updateOfferDetails(req: Request, res: Response): Promise<void> {
            try {
           
              console.log("Finding....")
              console.log(req.body);
              const formData= req.body;
              console.log("FormData from Offer", formData);
              const result = await this.offerController.updateOfferController(formData);
              if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
                return;
              }
          
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: response_message.UPDATEOFFERDETAILS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message:response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }




          async getSelectedOfferDetails(req: Request, res: Response): Promise<void> {
            try {

              const {offerId,managerId}=req.params;
              const result = await this.offerController.getSelectedOfferDataService(offerId,managerId);
        
      
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
      
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async fetchManagerWallet(req:Request,res:Response){
            try {
  
              const managerId=req.params.managerId;
          
              console.log("Chech the managerId",managerId);
          
              const savedEvent = await this.offerController.fetchWalletOfManager(managerId);
              if(savedEvent.result.success){
                res.status(HTTP_statusCode.OK).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
                return;
                }
                 res.status(HTTP_statusCode.NoChange).json({ success: savedEvent.result.success, message: savedEvent.result.message, data: savedEvent.result.data });
            } catch (error) {
              console.error("Error in check  Manager Wallet:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
              
            }
          }
          async fetchAllCompanyEvents(req:Request,res:Response){
            try {
              const companyName = req.params.companyName;
              console.log("your companyName:", companyName);
      
              const result = await this.managerController.fetchAllEventService(companyName);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while checking manager status:", error);
              res.status(500).json({
                  success: false,
                  error: response_message.ADMINLOGIN_ERROR
              });
          }

          }
          async getSelectedVerifierData(req:Request,res:Response){
            try {
              const verifierId = req.params.verifierId;
             
      
              const result = await this.verifierController.fetchSelectedVerifierData(verifierId);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while checking manager status:", error);
              res.status(500).json({
                  success: false,
                  error:response_message.ADMINLOGIN_ERROR
              });
          }
          }
          async postNewVerifier(req:Request,res:Response){
            try {
              console.log("Req body:",req.body);
              
              const formData= req.body;
              console.log("your companyNames:",formData);
      
              const result = await this.verifierController.postVerifierLoginDetails(formData);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while checking manager status:", error);
              res.status(500).json({
                  success: false,
                  error: response_message.ADMINLOGIN_ERROR
              });
          }

          }
          async updateVerifierData(req:Request,res:Response){
            try {
              console.log("Req body:",req.body);
              
              const formData= req.body;
              console.log("your FormData from backend:",formData);
      
              const result = await this.verifierController.updateVerifierDetails(formData);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while updating verifier:", error);
              res.status(500).json({
                  success: false,
                  error: response_message.ADMINLOGIN_ERROR
              });
          }
          }
          async updateSeatInformation(req:Request,res:Response){
            try {
              console.log("Req body:",req.body);
              
              const TicketData= req.body;
              console.log("your companyNames:",TicketData);
      
              const result = await this.eventController.postSeatDetails(TicketData);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while checking manager status:", error);
              res.status(500).json({
                  success: false,
                  error: response_message.ADMINLOGIN_ERROR
              });
          }
          }
    async fetchManagerNotification(req:Request,res:Response){
       try {
        console.log("Black");
        
              const managerId=req.params.managerId;
              if(!managerId) return;
             
      const savedEvent = await this.managerController.fetchNotificationOfManager(managerId);
      console.log("SavedEvent",savedEvent);
      
      if(savedEvent.success){

        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
        }
         res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Wallet:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
      
    }
          }

          async fetchNotificationCount(req:Request,res:Response){
            try{
            const managerId=req.params.managerId;
  
            console.log("Chech the managerId",managerId);
        
            const savedEvent = await this.managerController.NotificationCountOfManager(managerId);
            if(savedEvent.success){
              res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
              return;
              }
               res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
          } catch (error) {
            console.error("Error in check User Notification:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
            
          }
          }
          async checkDateValidation(req:Request,res:Response){
            try{
            
              const eventName=req.query.name;
              console.log("Maankind",eventName);
            const savedEvent = await this.managerController.checkValidDate(eventName as string);
            console.log('SavedEvent of manager video call',savedEvent);
            if(savedEvent.success){
              res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
              return;
              }
               res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
          } catch (error) {
            console.error("Error in check User Notification:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
            
          }
          }
          async fetchEventNames(req:Request,res:Response){
                try{
            
              const managerId=req.params.managerId;
              console.log("ManagerId",managerId);
            const savedEvent = await this.managerController.fetchEventNameService(managerId);
            console.log('SavedEvent of manager video call',savedEvent);
            if(savedEvent.success){
              res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
              return;
              }
               res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
          } catch (error) {
            console.error("Error in check User Notification:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
            
          }
          }
          async getAllEventDetails(req: Request, res: Response): Promise<void> {
            try {
              const managerId=req.params.managerId;
              const result = await this.eventController.getAllEventData(managerId);
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
              res.status(HTTP_statusCode.OK).json({
                message:response_message.GETALLEVENTDETAILS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async fetchManagerDashboardData(req:Request,res:Response){
            try {
              const managerId=req.params.managerId; 
              const result = await this.managerController.getUserCountAndRevenue(managerId);
              console.log("SavedEvent",result);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.OK).json({
                  message: result?.message ,
                });
                return;
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.message,
                data: result.data,
                
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message:response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async fetchDashboardGraph(req:Request,res:Response){
            try {
              const managerId=req.params.managerId; 
              const selectType=req.params.selectedType;
              const selectedTime=req.params.selectedTime;
              const result = await this.managerController.getDashboardGraph(managerId,selectType,selectedTime);
              console.log("SavedEvent",result);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.OK).json({
                  message: result?.message ,
                });
                return;
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.message,
                data: result.data,
                
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async fetchDashboardPieChart(req:Request,res:Response){
            try {
              const managerId=req.params.managerId; 
         
              const result = await this.managerController.getDashboardPieChart(managerId);
              console.log("SavedEvent",result);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.OK).json({
                  message: result?.message ,
                });
                return;
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.message,
                data: result.data,
                
              });
            } catch (error) {
              console.error("Error in getting pieChart:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }

          }
          async fetchDashboardBarChart(req:Request,res:Response){
                  try {
              const selectedEvent=req.params.selectedEvent; 
         
              const result = await this.managerController.getDashboardBarChart(selectedEvent);
              console.log("SavedEvent",result);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.OK).json({
                  message: result?.message ,
                });
                return;
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.message,
                data: result.data,
                
              });
            } catch (error) {
              console.error("Error in getting BarChart:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async getSelectedEventDetails(req: Request, res: Response): Promise<void> {
            try {

              const {id}=req.params;
              const result = await this.eventController.getSelectedEventDataService(id);
        
            
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
          
              res.status(HTTP_statusCode.OK).json({
                message:response_message.GETALLEVENTDETAILS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in fetching event:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }  
          async fetchEventTicketDetails(req:Request,res:Response){
            try {

              const {id}=req.params;
              const result = await this.eventController.getSelectedEventTicketDetails(id);
        
            
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || "Failed to fetch event ticket",
                });
              }
        
          
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLEVENTDETAILS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in event ticket fetching:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }

          async getTodaysBookingDetails(req:Request,res:Response):Promise<void>{
            try {

              const {managerId}=req.params;
              const result = await this.bookingController.getTodaysBookingDetails2(managerId);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.data.message,
                data: result.data.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }


          async getTotalBookingDetails(req:Request,res:Response):Promise<void>{
            try {

              const {managerId}=req.params;
              const result = await this.bookingController.getTotalBookingDetails2(managerId);
        
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
              res.status(HTTP_statusCode.OK).json({
                message: result.data.message,
                data: result.data.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
          async getBookedUserDetails(req:Request,res:Response){
            try {
              console.log("Sad");
              
              const managerName=req.query.name;
              console.log("ManagerName",managerName);
              const savedEvent = await this.bookingController.getBookedUserDetails2(managerName as string);
              if (savedEvent.success) {
                console.log("SavedEvent:",savedEvent);
                
                res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
                return;
              }
               res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: null });
            } catch (error) {
              console.error("Error in getEventHistoryDetails:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
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
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
            }
          }

          async getAllVerifiers(req:Request,res:Response){
            try {
              const managerName=req.params.managerName;
              console.log("Maaa",managerName);
              
          
              const result = await this.verifierController.getAllVerifierDetails(managerName);
              console.log("Nice",result.data)
          
              res.status(HTTP_statusCode.OK).json(result); // Send response to client
            } catch (error) {
              console.error("Error in saveBillingDetails:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
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
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
            }
          }
       
    }

       


    

