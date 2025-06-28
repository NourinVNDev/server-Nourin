import { injectable, inject } from "inversify";
import TYPES from "../../inversify/types";
import { IAdminLoginService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminLoginService";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from "../../utils/authUtil";
interface AdminPayload {
  email: string;
  role: string
}
@injectable()
export class AdminLoginController {
  constructor(
    @inject(TYPES.IAdminLoginService) private _adminLoginService: IAdminLoginService
  ) { }

  async createAdminData(req: Request, res: Response): Promise<void> {
    console.log('Hello Everyone');

    try {
      const formData = req.body;
      console.log("Received formData:", formData);


      const result = await this._adminLoginService.AdminloginDetails(formData);


      console.log("Login result:", result);

      if (result && result.user) {
        res.status(HTTP_statusCode.OK).json({
          message: response_message.CREATEADMINDATA_SUCCESS,
          data: result.user
        });
      } else {
        res.status(HTTP_statusCode.BadRequest).json({ message: response_message.CREATEADMINDATA_FAILED });
      }
    } catch (error) {

      console.error("Error during admin login:", error);


      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
    }
  }
  async adminLogin(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("hello baby");

      const formData = req.body;
      console.log(formData);
      let result = await this._adminLoginService.Adminlogin(formData);
      console.log("Admin Data", result);
      if (!result || !result.user || !result.user.user) {
        return res.status(HTTP_statusCode.BadRequest).json({ error: response_message.ADMINLOGIN_FAILED });
      }
      const userData = result.user.user;
      let admin = { email: userData.email, role: 'admin' };
      console.log("Credentials", userData.email)
      const accessToken = generateAccessToken(admin);
      const refreshToken = generateRefreshToken(admin);
      console.log("Tokens", accessToken, refreshToken);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 2 * 60 * 1000,

      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/api/admin/refresh-token', // Limit to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000

      });
      res.status(HTTP_statusCode.OK).json({ message: response_message.ADMINLOGIN_SUCCESS, data: (await result).user });

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.ADMINLOGIN_ERROR });
    }
  }
  async getUserDetails(req: Request, res: Response): Promise<void> {
    console.log("HELLO");

    try {
      const result = await this._adminLoginService.getUserDetailsService();

      console.log("data from getUser", result);
      res.status(HTTP_statusCode.OK).json({ result: result.user }); // Send the successful result
    } catch (error) {
      console.error('Error fetching user details:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.GETUSERDETAILS_ERROR
      }); // Handle and send error response
    }
  }
  async getManagerDetails(req: Request, res: Response): Promise<void> {
    try {

      console.log('Hello from Manger');
      const result = await this._adminLoginService.getManagerDetailsService();
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
      const result = await this._adminLoginService.getManagerEventService(managerId);
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

      const result = await this._adminLoginService.postToggleIsBlockService(userId, updatedStatus);

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR
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

      const result = await this._adminLoginService.postManagerIsBlockService(managerId, updatedStatus);

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


      const result = await this._adminLoginService.fetchAdminWalletService();

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR,
      });
    }
  }

  async reGenerateAdminAccessToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    console.log("Refresh Token", refreshToken);
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
      console.log("From Process", refreshTokenSecret);
      if (!refreshTokenSecret) {
        res.status(HTTP_statusCode.InternalServerError).json({
          success: false,
          message: response_message.REGENERATEADMINACCESSTOKEN_ERROR,
        });
        return; // End the execution
      }

      // Verify the refresh token and decode the payload
      const admin = jwt.verify(refreshToken, refreshTokenSecret) as AdminPayload;
      console.log("Again Checking", admin);
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
        { email: admin.email, role: admin.role },
        accessTokenSecret,
        { expiresIn: "15m" }
      );
      res.cookie('accessToken', adminToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 2 * 60 * 1000

      });

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: response_message.REGENERATEADMINACCESSTOKEN_SUCCESS,
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
  async fetchAdminDashboardData(req: Request, res: Response) {
    try {

      const result = await this._adminLoginService.getUserManagerDetailsService();
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
  async fetchDashboardGraph(req: Request, res: Response) {
    try {
      const selectType = req.params.selectedType;
      const selectedTime = req.params.selectedTime;
      const result = await this._adminLoginService.getDashboardGraph(selectType, selectedTime);
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


      const result = await this._adminLoginService.getDashboardPieChart();
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

  async fetchDashboardBarChart(req: Request, res: Response) {
    try {

      const selectedEvent = req.params.selectedEvent;
      const result = await this._adminLoginService.getDashboardBarChart(selectedEvent);
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

      const result = await this._adminLoginService.postCategoryIsBlockService(categoryId, updatedStatus);

      res.status(HTTP_statusCode.OK).json({ result: result.result.user });
    } catch (error) {
      console.error('Error toggling block status:', error instanceof Error ? error.message : error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: response_message.POSTTOGGLEISBLOCK_ERROR,
      });
    }
  }


}