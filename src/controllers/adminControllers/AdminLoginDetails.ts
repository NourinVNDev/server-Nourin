import { Request, Response } from "express";  // Import types
import {AdminLoginServices} from "../../service/adminServices/adminloginService";
import { adminCategory } from "./adminCategoryDetails";
import { generateAccessToken,generateRefreshToken } from "../../config/authUtils";
import { IadminloginService } from "../../service/adminServices/IadminloginService";
import jwt from 'jsonwebtoken';
import HTTP_statusCode from "../../config/enum/enum";

interface AdminPayload {
  email: string;
  role:string
}

export  class AdminLogin {
    private adminController:IadminloginService;
    private  adminCategoryController:adminCategory;
    constructor(adminServiceInstance:IadminloginService){
        this.adminController=adminServiceInstance;
        this.adminCategoryController=new adminCategory(adminServiceInstance);
    }
    async createAdminData(req: Request, res: Response): Promise<void> {
        console.log('Hello Everyone');
        
        try {
            const formData = req.body;
            console.log("Received formData:", formData);


            const result = await this.adminController.AdminloginDetails(formData);

            // Log the result for debugging (optional)
            console.log("Login result:", result);

            if (result && result.user) {
                // Send success response if `user` is present
                res.status(HTTP_statusCode.OK).json({ 
                    message: 'Login Success',
                    data: result.user // Assuming `user` is a property in the service result
                });
            } else {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'Invalid login credentials' });
            }
        } catch (error) {
            // Log the error for debugging
            console.error("Error during admin login:", error);

            // Send error response
            res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
        }
    }
    async adminLogin(req: Request, res: Response): Promise<void|any>{
        try {
            console.log("hello baby");
            
         const formData=req.body;
         console.log(formData);
        let result= await this.adminController.Adminlogin(formData);
        console.log("Admin Data",result);           
          if (!result || !result.user || !result.user.user) {
                return res.status(HTTP_statusCode.BadRequest).json({ error: 'Invalid login credentials' });
             }
                            const userData = result.user.user;
                    
                            // Log and remove password
      
                            let admin={email:userData.email,role:'admin'};
                            console.log("Credentials",userData.email)
                            const accessToken = generateAccessToken(admin);
                            const refreshToken = generateRefreshToken(admin);
                            console.log("Tokens",accessToken,refreshToken);
                             // Set cookies securely
                        res.cookie('adminToken', accessToken, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            path: '/',
                        });
            
                        res.cookie('adminRefreshToken', refreshToken, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            path: '/',
                        });
        


        res.status(HTTP_statusCode.OK).json({ message: 'Login Success' ,data:(await result).user});

        } catch (error) {
            res.status(HTTP_statusCode.InternalServerError).json({ error: 'Something went wrong' });
        }
    }

        async reGenerateAdminAccessToken(req: Request, res: Response): Promise<void> {
                const refreshToken = req.cookies.adminRefreshToken; // Read refresh token from cookies
              console.log("Refresh Token",refreshToken);
                if (!refreshToken) {
                  console.log("snake");
                  
                  res.status(HTTP_statusCode.NotFound).json({
                    success: false, 
                    message: " Admin Refresh token not provided",
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
                      message: " Admin Refresh token secret not defined in environment variables",
                    });
                    return; // End the execution
                  }
              
                  // Verify the refresh token and decode the payload
                  const admin = jwt.verify(refreshToken, refreshTokenSecret) as AdminPayload;
                  console.log("Again Checking",admin);
                  // Ensure the email exists in the decoded token
                  if (!admin.email) {
                    res.status(HTTP_statusCode.NotFound).json({
                      success: false,
                      message: "Invalid refresh token: Admin email not found",
                    });
                    return; // End the execution
                  }
              
                  // Generate a new access token
                  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
                  if (!accessTokenSecret) {
                    res.status(HTTP_statusCode.InternalServerError).json({
                      success: false,
                      message: "Admin Access token secret not defined in environment variables",
                    });
                    return; // End the execution
                  }
              
                  const adminToken = jwt.sign(
                    { email: admin.email,role:admin.role},
                    accessTokenSecret,
                    { expiresIn: "15m" }
                  );
                  res.cookie('adminToken', adminToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge:2*60*1000
                });
              
                  res.status(HTTP_statusCode.OK).json({
                    success: true,
                    message: "Manager Access token regenerated successfully",
                    accessToken: adminToken,
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
    async getUserDetails(req: Request, res: Response): Promise<void> {
        console.log("HELLO");
        
        try {
            const result = await this.adminController.getUserDetailsService();

            console.log("data from getUser",result);
            res.status(HTTP_statusCode.OK).json({result:result.user}); // Send the successful result
        } catch (error) {
            console.error('Error fetching user details:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to fetch user details',
            }); // Handle and send error response
        }
    }
    async postToggleIsBlock(req: Request, res: Response): Promise<void|any> {
        console.log('try');
        try {
            const {userId,updatedStatus } = req.body;
            console.log("user",userId,updatedStatus)
    
            // Validate input
            if (typeof updatedStatus !== 'boolean' || !userId) {
                return res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: 'Invalid request data',
                });
            }
    
            const result = await this.adminController.postToggleIsBlockService(userId, updatedStatus);
    
            res.status(HTTP_statusCode.OK).json({ result: result.result.user });
        } catch (error) {
            console.error('Error toggling block status:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to toggle block status',
            });
        }
    }
    

    async getManagerDetails(req:Request,res:Response):Promise<void>{
        try {

            console.log('Hello from Manger');
            const result=await  this.adminController.getManagerDetailsService();
            console.log('data from getManager',result);
            res.status(HTTP_statusCode.OK).json({result:result});
        } catch (error) {
            console.error('Error fetching user details:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to fetch user details',
            });
            
        }
    }

    async postManagerIsBlock(req: Request, res: Response): Promise<void|any> {
      
        try {
            const {managerId,updatedStatus } = req.body;
            console.log("user",managerId,updatedStatus)
    
            // Validate input
            if (typeof updatedStatus !== 'boolean' || !managerId) {
                return res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: 'Invalid request data',
                });
            }
    
            const result = await this.adminController.postManagerIsBlockService(managerId, updatedStatus);
    
            res.status(HTTP_statusCode.OK).json({ result: result.result.user });
        } catch (error) {
            console.error('Error toggling block status:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to toggle block status',
            });
        }
    }
    async getAdminWalletDetails(req:Request,res:Response){
        try {
        
    
            const result = await this.adminController.fetchAdminWalletService();
    
            res.status(HTTP_statusCode.OK).json({ result: result.result.user });
        } catch (error) {
            console.error('Error toggling block status:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to toggle block status',
            });
        } 
    }
    async getCategoryDetails(req:Request,res:Response):Promise<void>{
        try {
            console.log("Hello from Category");
            const result=await this.adminCategoryController.getCategoryController(req,res);
            console.log('Category',result?.result);
            res.status(HTTP_statusCode.OK).json({
                message: "Event data saved successfully",
                data: result?.result,
            });
            
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
        }
        
    }
    async fetchSelectedCategory(req:Request,res:Response):Promise<void>{
        try {
            console.log("Hello from  fetching Category");
            console.log("Checking",req.params);
            
            const {id}=req.params;
            const categoryId=id;
            console.log("Scaaam",categoryId);
            
            const result=await this.adminCategoryController.fetchSelectedCategoryController(categoryId,req,res);
            console.log('Category',result?.result);
            res.status(HTTP_statusCode.OK).json({
                message: "Selected Category fetched successfully",
                data: result?.result,
            });
            
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
        }
    }

    async editSelectedCategory(req:Request,res:Response):Promise<void|any>{
        try {
            console.log("Hello from  editing selected Category");
            console.log("Checking",req.params);
            const category=req.body.category;
            
            const {categoryId}=req.params;
         
            console.log("chill",categoryId,category);
            
            const result=await this.adminCategoryController.editSelectedCategoryController(category,categoryId,req,res);
            console.log('Category',result?.result);
            res.status(HTTP_statusCode.OK).json({
                message: "Category edited successfully",
                data: result?.result,
            });
            
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
        }
    }
    async postCategoryIsBlock(req: Request, res: Response): Promise<void|any> {
      
        try {
            const {categoryId,updatedStatus } = req.body;
            console.log("user",categoryId,updatedStatus)
    
            // Validate input
            if (typeof updatedStatus !== 'boolean' || !categoryId) {
                return res.status(HTTP_statusCode.BadRequest).json({
                    success: false,
                    message: 'Invalid request data',
                });
            }
    
            const result = await this.adminController.postCategoryIsBlockService(categoryId, updatedStatus);
    
            res.status(HTTP_statusCode.OK).json({ result: result.result.user });
        } catch (error) {
            console.error('Error toggling block status:', error instanceof Error ? error.message : error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                message: 'Failed to toggle block status',
            });
        }
    }
    async addEventCategoryDetails(req: Request, res: Response): Promise<void> {
        try {
            const formData = req.body;
            console.log('add Category', formData);
            
            const result = await this.adminCategoryController.addEventCategoryController(formData, req, res);
            console.log("Full Result Structure:", JSON.stringify(result, null, 2));
    
            const actualResult = result?.result?.result?.result; // Extract actual data
            
            if (actualResult?.success === true) {
                res.status(HTTP_statusCode.OK).json({
                    message: "Category data saved successfully",
                    data: actualResult.data,
                });
            } else {
                res.status(HTTP_statusCode.BadRequest).json({
                    message: actualResult?.message || "Duplicate Category Name",
                    data: null,
                });
            }
        } catch (error) {
            console.error("Error in getCategoryDetails:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ message: "Internal server error", error });
        }
    }

  
    


    
};

export default AdminLogin;

