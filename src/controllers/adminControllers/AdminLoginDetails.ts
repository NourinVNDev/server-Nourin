import { Request, response, Response } from "express";  // Import types
import { AdminLoginServices } from "../../service/adminServices/adminloginService";
import { adminCategory } from "./adminCategoryDetails";
import { generateAccessToken, generateRefreshToken } from "../../config/authUtils";
import { IadminloginService } from "../../service/adminServices/IadminloginService";
import jwt from 'jsonwebtoken';
import HTTP_statusCode from "../../config/enum/enum";
import response_message from "../../config/enum/response_message";
import { adminOfferControllers } from "./adminOfferControllers";


interface AdminPayload {
  email: string;
  role: string
}

export class AdminLogin {
  private adminController: IadminloginService;
  private adminCategoryController: adminCategory;
  private adminOfferController:adminOfferControllers;
  constructor(adminServiceInstance: IadminloginService) {
    this.adminController = adminServiceInstance;
    this.adminCategoryController = new adminCategory(adminServiceInstance);
    this.adminOfferController=new adminOfferControllers(adminServiceInstance);
  }

  async createAdminData(req: Request, res: Response): Promise<void> {
    console.log('Hello Everyone');

    try {
      const formData = req.body;
      console.log("Received formData:", formData);


      const result = await this.adminController.AdminloginDetails(formData);


      console.log("Login result:", result);

      if (result && result.user) {
        res.status(HTTP_statusCode.OK).json({
          message: response_message.CREATEADMINDATA_SUCCESS,
          data: result.user
        });
      } else {
        res.status(HTTP_statusCode.BadRequest).json({ message:response_message.CREATEADMINDATA_FAILED });
      }
    } catch (error) {

      console.error("Error during admin login:", error);

  
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR});
    }
  }

  async adminLogin(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("hello baby");

      const formData = req.body;
      console.log(formData);
      let result = await this.adminController.Adminlogin(formData);
      console.log("Admin Data", result);
      if (!result || !result.user || !result.user.user) {
        return res.status(HTTP_statusCode.BadRequest).json({ error: response_message.ADMINLOGIN_FAILED});
      }
      const userData = result.user.user;
      let admin = { email: userData.email, role: 'admin'};
      console.log("Credentials", userData.email)
      const accessToken = generateAccessToken(admin);
      const refreshToken = generateRefreshToken(admin);
      console.log("Tokens", accessToken, refreshToken);
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
      res.status(HTTP_statusCode.OK).json({ message: response_message.ADMINLOGIN_SUCCESS, data: (await result).user });

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.ADMINLOGIN_ERROR});
    }
  }

    async reGenerateAdminAccessToken(req: Request, res: Response): Promise<void> {
                const refreshToken = req.cookies.refreshToken; 
              console.log("Refresh Token",refreshToken);
                if (!refreshToken) {
                  console.log("snake");
                  
                  res.status(HTTP_statusCode.NotFound).json({
                    success: false, 
                    message: response_message.REGENERATEADMINACCESSTOKEN_FAILED,
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
                      message:response_message.REGENERATEADMINACCESSTOKEN_ERROR,
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
                    return; 
                  }
              
                  const adminToken = jwt.sign(
                    { email: admin.email,role:admin.role},
                    accessTokenSecret,
                    { expiresIn: "15m" }
                  );
                  res.cookie('accessToken', adminToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                  
                });
              
                  res.status(HTTP_statusCode.OK).json({
                    success: true,
                    message:response_message.REGENERATEADMINACCESSTOKEN_SUCCESS,
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
                message: response_message.GETUSERDETAILS_ERROR
            }); // Handle and send error response
        }
    }
  async fetchAdminDashboardData(req: Request, res: Response) {
     try {
             
              const result = await this.adminController.getUserManagerDetailsService();
              console.log("SavedEvent",result);
        
              
              if (!result?.success) {
                 res.status(HTTP_statusCode.OK).json({
                  message: result?.message ,
                });
                return;
              }
        
           
              res.status(HTTP_statusCode.OK).json({
                message: result.message,
                data: result.user,
                
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }


  }
  async fetchDashboardGraph(req: Request, res: Response) {
    try {
      const selectType = req.params.selectedType;
      const selectedTime = req.params.selectedTime;
      const result = await this.adminController.getDashboardGraph(selectType, selectedTime);
      console.log("SavedEvent", result);


      if (!result?.success) {
        res.status(HTTP_statusCode.OK).json({
          message: result?.message,
        });
        return;
      }


      res.status(HTTP_statusCode.OK).json({
        message: result.message,
        data: result.user,

      });
    } catch (error) {
      console.error("Error in getAllOffers:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
        error: error instanceof Error ? error.message : error,
      });
    }

  }

  async fetchDashboardPieChart(req: Request, res: Response) {
    try {


      const result = await this.adminController.getDashboardPieChart();
      console.log("SavedEvent", result);


      if (!result?.success) {
        res.status(HTTP_statusCode.OK).json({
          message: result?.message,
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
      const result = await this.adminController.getDashboardBarChart(selectedEvent);
      console.log("SavedEvent", result);


      if (!result?.success) {
        res.status(HTTP_statusCode.OK).json({
          message: result?.message,
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
     async createNewOffer(req: Request, res: Response){
              try {
              
                console.log(req.body);
                const  formData  = req.body;
                console.log("FormData from Offer", formData);
                const result = await this.adminOfferController.createNewOfferController(formData);
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

              async getAllOffers(req: Request, res: Response): Promise<void> {
                        try {
                       
                          const result = await this.adminOfferController.getAllOffers();
                    
                       
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
            async getSelectedOfferDetails(req: Request, res: Response): Promise<void> {
            try {

              const {offerId}=req.params;
              const result = await this.adminOfferController.getSelectedOfferDataService(offerId);
        
      
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
              async updateOfferDetails(req: Request, res: Response): Promise<void> {
                      try {
                        console.log("Finding....")
                        console.log(req.body);
                        const formData= req.body;
                        console.log("FormData from Offer", formData);
                        const result = await this.adminOfferController.updateOfferController(formData);
                    
                        // Check if the result indicates a failure
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


  async postToggleIsBlock(req: Request, res: Response): Promise<void | any> {
    console.log('try');
    try {
      const { userId, updatedStatus } = req.body;
      console.log("user", userId, updatedStatus)

      // Validate input
      if (typeof updatedStatus !== 'boolean' || !userId) {
        return res.status(HTTP_statusCode.BadRequest).json({
          success: false,
          message: response_message.POSTTOGGLEISBLOCK_FAILED,
        });
      }

      const result = await this.adminController.postToggleIsBlockService(userId, updatedStatus);

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message:response_message.POSTTOGGLEISBLOCK_ERROR
      });
    }
  }


  async getManagerDetails(req: Request, res: Response): Promise<void> {
    try {

      console.log('Hello from Manger');
      const result = await this.adminController.getManagerDetailsService();
      console.log('data from getManager', result);
      res.status(HTTP_statusCode.OK).json({ result: result });
    } catch (error) {
      console.error('Error fetching user details:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.GETUSERDETAILS_ERROR,
      });

    }
  }


  async getEventAndBookedDetails(req: Request, res: Response): Promise<void> {
    try {

      const managerId = req.params.managerId;
      const result = await this.adminController.getManagerEventService(managerId);
      console.log('data from getManager', result);
      res.status(HTTP_statusCode.OK).json({ result: result });
    } catch (error) {
      console.error('Error fetching user details:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.GETUSERDETAILS_ERROR,
      });

    }
  }

  async postManagerIsBlock(req: Request, res: Response): Promise<void | any> {

    try {
      const { managerId, updatedStatus } = req.body;
      console.log("user", managerId, updatedStatus)

      // Validate input
      if (typeof updatedStatus !== 'boolean' || !managerId) {
        return res.status(HTTP_statusCode.BadRequest).json({
          success: false,
          message: response_message.POSTTOGGLEISBLOCK_FAILED,
        });
      }

      const result = await this.adminController.postManagerIsBlockService(managerId, updatedStatus);

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR,
      });
    }
  }

  async getAdminWalletDetails(req: Request, res: Response) {
    try {


      const result = await this.adminController.fetchAdminWalletService();

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR,
      });
    }
  }
  async getCategoryDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Hello from Category");
      const result = await this.adminCategoryController.getCategoryController(req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message:response_message.GETCATEGORYDETAILS_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }

  }
  async fetchSelectedCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("Hello from  fetching Category");
      console.log("Checking", req.params);

      const { id } = req.params;
      const categoryId = id;
      console.log("Scaaam", categoryId);

      const result = await this.adminCategoryController.fetchSelectedCategoryController(categoryId, req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message:response_message.FETCHSELECTEDCATEGORY_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }

  async editSelectedCategory(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("Hello from  editing selected Category");
      console.log("Checking", req.params);
      const category = req.body.category;

      const { categoryId } = req.params;

      console.log("chill", categoryId, category);

      const result = await this.adminCategoryController.editSelectedCategoryController(category, categoryId, req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message: response_message.EDITSELECTEDCATEGORY_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
  async postCategoryIsBlock(req: Request, res: Response): Promise<void | any> {

    try {
      const { categoryId, updatedStatus } = req.body;
      console.log("user", categoryId, updatedStatus)

      // Validate input
      if (typeof updatedStatus !== 'boolean' || !categoryId) {
        return res.status(HTTP_statusCode.BadRequest).json({
          success: false,
          message: response_message.POSTTOGGLEISBLOCK_FAILED,
        });
      }

      const result = await this.adminController.postCategoryIsBlockService(categoryId, updatedStatus);

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR,
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
          message: response_message.ADDEVENTCATEGORYDETAILS_SUCCESS,
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
      res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
};

export default AdminLogin;

