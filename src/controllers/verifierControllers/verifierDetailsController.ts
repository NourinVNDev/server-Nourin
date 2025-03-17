import { IVerifierService } from "../../service/verifierServices/IVerifierService";
import { verifierDetailsService } from "../../service/verifierServices/verifierDetailsService";
import { Request, Response } from "express";
import HTTP_statusCode from "../../config/enum/enum";
import GenerateOTP from "../../config/nodemailer";

export class VerifierDetailsController {
    private verifierController: IVerifierService;

    private globalOTP: string = '';

    constructor(verifierServiceInstance: verifierDetailsService) {
        this.verifierController = verifierServiceInstance;
    }



    async checkManagerHaveEvent(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            console.log("Manager Email:", email);

            const result = await this.verifierController.checkIfManagerActive(email);

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
            const { enteredOtp } = req.params;
            console.log("Enter OTP:", enteredOtp);
            if(this.globalOTP===enteredOtp){
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
    
            // Send the result back to the client after the operation
            res.status(200).json(result); // Send a successful response
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
            const companyName = req.params.companyName;
            console.log("your companyName:", companyName);
    
            const result = await this.verifierController.fetchAllEvents(companyName);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error while checking manager status:", error);
            res.status(500).json({
                success: false,
                error: 'Something went wrong'
            });
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

    async markUserEntry(req:Request,res:Response):Promise<void>{
        try {
            const bookingId = req.params.bookingId;
            console.log("bookedID:", bookingId);
    
            const result = await this.verifierController.markUserEntryService(bookingId);
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
