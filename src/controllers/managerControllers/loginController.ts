import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import TYPES from "../../inversify/types";
import jwt from 'jsonwebtoken';
import { IManagerLoginService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerLoginService";
import { generateAccessToken, generateRefreshToken } from "../../utils/authUtil";
let globalOTP: number | null = null;
interface ManagerPayload {
  email: string;
  role: string
}
@injectable()
export class ManagerLoginController {

  constructor(
    @inject(TYPES.IManagerLoginService) private _managerLoginService: IManagerLoginService
  ) { }
  async managerRegister(req: Request, res: Response): Promise<void> {
    console.log('Hai');

    try {
      const email = req.body.email;
      console.log('hello', email);

      const otpNumber = await this._managerLoginService.CheckingEmail(email);

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
      console.log("Hash", globalOTP);


      res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERREGISTER_SUCCESS, otpData: otpNumber });
    } catch (error) {
      console.error("Error saving user data:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERREGISTER_ERROR });
    }

  }
  async managerVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const otp = req.body.otp;
      const formData = req.body;
      console.log(req.body);
      console.log(formData);

      console.log("Received OTP:", otp, "Global OTP:", globalOTP);
      const result = this._managerLoginService.managerVerifyService(formData, otp, globalOTP);
      if ((await result).success) {
        res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERVERIFYOTP_SUCCESS });
      } else {
        console.log("South");

        res.status(HTTP_statusCode.BadRequest).json({ message: response_message.MANAGERVERIFYOTP_FAILED });
      }

    } catch (error) {
      console.error("Error saving user data:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERVERIFYOTP_ERROR });
    }

  }
  async managerLogin(req: Request, res: Response): Promise<void | any> {
    try {
      const formData = req.body;
      console.log('Received login data:', formData);

      // Get login result
      const result = await this._managerLoginService.managerLoginService(formData);
      console.log("Result  of Login", result);

      if (!result || !result.user) {
        return res.status(HTTP_statusCode.OK).json({ message: response_message.CREATEADMINDATA_FAILED });
      }
      const userData = result.user;

      let manager = { email: userData.email, role: 'manager' };
      const accessToken = generateAccessToken(manager);
      const refreshToken = generateRefreshToken(manager);
      console.log("Tokens", accessToken, refreshToken);

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
        path: '/', // Limit to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(HTTP_statusCode.OK).json({ message: response_message.ADMINLOGIN_SUCCESS, data: (await result).user });

    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEADMINDATA_ERROR });
    }
  }

  async managerForgotPassword(req: Request, res: Response): Promise<void> {
    console.log("Hello");

    try {

      const email = req.body.email;
      console.log(email);
      let result = this._managerLoginService.managerForgotEmail(email);
      if ((await result).success) {
        globalOTP = Number((await result).otpValue);
        res.status(HTTP_statusCode.OK).json({ message: (await result).message, data: (await result).otpValue });
      } else {
        res.status(HTTP_statusCode.OK).json({ message: (await result).message, data: (await result).otpValue });
      }


    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.ADMINLOGIN_ERROR });
    }
  }

  async managerVerifyOtpForForgot(req: Request, res: Response): Promise<void> {
    try {
      const otp = req.body.otp;
      const email = req.body.email;
      console.log(req.body);


      console.log("Received OTP:", otp, "Global OTP:", globalOTP);
      const result = this._managerLoginService.verifyOtpForForgot(email, otp, globalOTP);
      if ((await result).success) {
        res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERVERIFYOTPFORFORGOT_SUCCESS });
      } else {
        res.status(HTTP_statusCode.OK).json({ message: (await result).message });
      }

    } catch (error) {
      console.error("Error saving user data:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.MANAGERVERIFYOTP_ERROR });
    }

  }

  async managerResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const password = req.body.password;
      const password1 = req.body.confirmPassword




      const email = req.body.email;
      console.log(req.body);
      console.log(email);

      let result = this._managerLoginService.resetPasswordDetailsForManager(email, password, password1);
      res.status(HTTP_statusCode.OK).json({ message: response_message.MANAGERRESETPASSWORD_SUCCESS, data: (await result).user });

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.ADMINLOGIN_ERROR });
    }
  }
  async getEventTypeData(req: Request, res: Response): Promise<void | any> {
    try {
      const result = await this._managerLoginService.getEventTypeDataService(req); // No res here, just the result

      // Check if the result is successful or not
      if (!result.success) {
        return res.status(HTTP_statusCode.InternalServerError).json({
          message: result.message
        });
      }

      res.status(HTTP_statusCode.OK).json({
        message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
        data: result.data
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }

  }
  async getManagerProfileDetails(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("Req.params", req.params);

      const { companyName } = req.params;
      console.log("CompnayName", companyName);
      const result = await this._managerLoginService.getManagerProfileService(companyName); // No res here, just the result

      // Check if the result is successful or not
      if (!result.success) {
        return res.status(HTTP_statusCode.InternalServerError).json({
          message: result.message
        });
      }

      res.status(HTTP_statusCode.OK).json({
        message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
        data: result.data
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
  async updateManagerProfile(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("Req.params", req.params);

      const { phone, email } = req.body;
      console.log("Manager Details", email, phone);
      const formData = {
        email: email,
        phoneNo: phone
      }
      const result = await this._managerLoginService.updateManagerProfileService(formData); // No res here, just the result

      // Check if the result is successful or not
      if (!result.success) {
        return res.status(HTTP_statusCode.InternalServerError).json({
          message: result.message
        });
      }

      res.status(HTTP_statusCode.OK).json({
        message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
        data: result.data
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
  async updateManagerPassword(req: Request, res: Response): Promise<void | any> {
    try {


      const { newPassword, email } = req.body;
      console.log("Manager Details", email, newPassword);
      const formData = {
        email: email,
        newPassword: newPassword
      }
      const result = await this._managerLoginService.updateManagerPasswordService(formData); // No res here, just the result

      // Check if the result is successful or not
      if (!result.success) {
        return res.status(HTTP_statusCode.InternalServerError).json({
          message: result.message
        });
      }

      res.status(HTTP_statusCode.OK).json({
        message: response_message.UPDATEMANAGERPASSWORD_SUCCESS,
        data: result.data
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
  async reGenerateManagerAccessToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
    console.log("Refresh Token", refreshToken);
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
      console.log("From Process", refreshTokenSecret);
      if (!refreshTokenSecret) {
        res.status(HTTP_statusCode.InternalServerError).json({
          success: false,
          message: " Manager Refresh token secret not defined in environment variables",
        });
        return; // End the execution
      }

      // Verify the refresh token and decode the payload
      const manager = jwt.verify(refreshToken, refreshTokenSecret) as ManagerPayload;
      console.log("Again Checking", manager);
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
          message: response_message.REGENERATEMANAGERACCESSTOKEN_ERROR,
        });
        return; // End the execution
      }

      const managerToken = jwt.sign(
        { email: manager.email, role: manager.role },
        accessTokenSecret,
        { expiresIn: "15m" }
      );
      res.cookie('accessToken', managerToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 2 * 60 * 1000
      });

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: response_message.REGENERATEMANAGERACCESSTOKEN_SUCCESS,
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
  async fetchManagerNotification(req: Request, res: Response) {
    try {

      const managerId = req.params.managerId;
      if (!managerId) return;

      const savedEvent = await this._managerLoginService.fetchNotificationOfManagerService(managerId);
      console.log("SavedEvent", savedEvent);

      if (savedEvent.success) {

        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Wallet:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });

    }
  }

  async fetchAllCompanyEvents(req: Request, res: Response) {
    try {
      const companyName = req.params.companyName;

      const result = await this._managerLoginService.fetchAllEventService(companyName);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error while checking manager status:", error);
      res.status(500).json({
        success: false,
        error: response_message.ADMINLOGIN_ERROR
      });
    }

  }

  async fetchManagerDashboardData(req: Request, res: Response) {
    try {
      const managerId = req.params.managerId;
      const result = await this._managerLoginService.getUserCountAndRevenueService(managerId);
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
      console.error("Error in getAllOffers:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  async fetchDashboardGraph(req: Request, res: Response) {
    try {
      const managerId = req.params.managerId;
      const selectType = req.params.selectedType;
      const selectedTime = req.params.selectedTime;
      const result = await this._managerLoginService.getDashboardGraphService(managerId, selectType, selectedTime);
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
      console.error("Error in getAllOffers:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  async fetchDashboardPieChart(req: Request, res: Response) {
    try {
      const managerId = req.params.managerId;

      const result = await this._managerLoginService.getDashboardPieChartService(managerId);
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

      const result = await this._managerLoginService.getDashboardBarChartService(selectedEvent);
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
      console.error("Error in getting BarChart:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  async fetchNotificationCount(req: Request, res: Response) {
    try {
      const managerId = req.params.managerId;

      console.log("Chech the managerId", managerId);

      const savedEvent = await this._managerLoginService.NotificationCountOfManagerService(managerId);
      if (savedEvent.success) {
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });

    }
  }
  async checkDateValidation(req: Request, res: Response) {
    try {

      const eventName = req.query.name;
      console.log("Maankind", eventName);
      const savedEvent = await this._managerLoginService.checkValidDate(eventName as string);
      console.log('SavedEvent of manager video call', savedEvent);
      if (savedEvent.success) {
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });

    }
  }
  async fetchEventNames(req: Request, res: Response) {
    try {

      const managerId = req.params.managerId;
      console.log("ManagerId", managerId);
      const savedEvent = await this._managerLoginService.fetchEventNameService(managerId);
      console.log('SavedEvent of manager video call', savedEvent);
      if (savedEvent.success) {
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });

    }
  }





}