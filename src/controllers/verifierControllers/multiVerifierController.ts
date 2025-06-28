import { injectable, inject } from "inversify";
import TYPES from "../../inversify/types";
import { IMultiVerifierService } from "../../interfaces/verifierInterfaces/serviceInterfaces/IMultiVerifierService";
import { Request, Response } from "express";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import GenerateOTP from "../../config/nodemailer.config";
import { generateAccessToken, generateRefreshToken } from "../../utils/authUtil";
import jwt from 'jsonwebtoken'
interface VerifierPayload {
    email: string,
    role: string
}
@injectable()
export class MultiVerifierController {
    private globalOTP: string = '';
    constructor(
        @inject(TYPES.IMultiVerifierService) private _verifierService: IMultiVerifierService
    ) { }

    async checkVerifierHaveAccount(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            console.log("Manager Email:", email);

            const result = await this._verifierService.checkIfVerifierActive(email);

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
                error: response_message.ADMINLOGIN_ERROR
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
                error: response_message.ADMINLOGIN_ERROR
            });
        }
    }
    async verifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { enteredOtp, email } = req.params;
            console.log("Enter OTP:", enteredOtp);
            if (this.globalOTP === enteredOtp) {

                const verifier = { email: email, role: 'verifier' };
                const verifierAccessToken = generateAccessToken(verifier);
                const verifierRefreshToken = generateRefreshToken(verifier);
                res.cookie('accessToken', verifierAccessToken, {
        httpOnly: true,  // Changed from false to true for security
        secure: true,    // Force HTTPS in production
        sameSite: 'none', // Keep this if you need cross-site cookies
        path: '/',
        maxAge: 2 * 60 * 1000, // 2 minutes
      });

      res.cookie('refreshToken', verifierRefreshToken, {
        httpOnly: true,  // Must be true for refresh tokens
        secure: true,
        sameSite: 'none',
        path: '/api/verifier/refresh-token', // Limit to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
                res.status(HTTP_statusCode.OK).json({ success: true, message: response_message.VERIFYOTP_SUCCESS });
            } else {
                res.json({ success: false, message: response_message.VERIFYOTP_FAILED });
            }
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }

    }
    async postVerifierLogin(req: Request, res: Response): Promise<void> {
        try {
            const formData = req.body;
            console.log("Form Input Data", formData);

            const result = await this._verifierService.verifierLoginDetails(formData);



            res.status(200).json(result);

        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }
    }
    async reGenerateVerifierAccessToken(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken; // Read refresh token from cookies
        console.log("Refresh Token", refreshToken);
        if (!refreshToken) {
            console.log("snake");

            res.status(HTTP_statusCode.NotFound).json({
                success: false,
                message: response_message.REGENERATEVERIFIERACCESSTOKEN_FAILED,
            });
            return;
        }

        try {

            const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
            console.log("From Process", refreshTokenSecret);
            if (!refreshTokenSecret) {
                res.status(HTTP_statusCode.InternalServerError).json({
                    success: false,
                    message: response_message.REGENERATEVERIFIERACCESSTOKEN_ERROR,
                });
                return;
            }


            const verifier = jwt.verify(refreshToken, refreshTokenSecret) as VerifierPayload;
            console.log("Again Checking", verifier);
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
                { email: verifier.email, role: verifier.role },
                accessTokenSecret,
                { expiresIn: "15m" }
            );
            res.cookie('accessToken', verifierAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 2 * 60 * 1000
            });

            res.status(HTTP_statusCode.OK).json({
                success: true,
                message: response_message.REGENERATEVERIFIERACCESSTOKEN_SUCCESS,
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

    async getAllCompanyEvents(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email;
            console.log("your Email:", email);

            const result = await this._verifierService.fetchAllEvents(email);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }
    }
    async getBookedDetails(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            console.log("EventId:", eventId);

            const result = await this._verifierService.fetchAllBookingDetails(eventId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }
    }

    async getSingleUserData(req: Request, res: Response) {
        try {
            const bookedID = req.params.bookedId;
            const userName = req.params.userName;

            const result = await this._verifierService.fetchSingleUserDetails(bookedID, userName);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }

    }
    async markUserEntry(req: Request, res: Response): Promise<void> {
        try {
            const bookingId = req.params.bookedId;
            console.log("bookedID:", bookingId);
            const userName = req.params.userName;

            const result = await this._verifierService.markUserEntryService(bookingId, userName);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: response_message.ADMINLOGIN_ERROR
            });
        }
    }


}