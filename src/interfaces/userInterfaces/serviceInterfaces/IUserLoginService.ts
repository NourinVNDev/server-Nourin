import { FormData } from "../../../dtos/user.dto";
export interface IUserLoginService {
    getAllEventService(): Promise<{ success: boolean, message: string, data: any[] }>;
    loginDetails(formData: FormData): Promise<{ success: boolean, message: string, user?: any | null, categoryName?: any | null }>;
    CheckingEmail(email: string): Promise<{ success: number | boolean | string }>;
    verifyService(formData: FormData, otp: string, globalOTP: string | number | null): Promise<{ success: boolean, message: string, user: any }>;
    CheckingEmailForResendOtp(email: string): Promise<{ success: number | boolean | string }>;
    GoogleAuth(AuthData: string): Promise<{ success: boolean, message: string, user: any }>;
    forgotEmailDetails(email: string): Promise<{ success: boolean; message: string; otpValue: string | null }>;
    verifyForgotOtpService(otp: string, globalOTP: string | number | null): Promise<{ success: boolean, message: string }>;
    getCategoryTypeServiice(categoryName: string): Promise<{ success: boolean, message: string, user: any }>;//1
    getWholeCategoryDetails(): Promise<{ success: boolean, message: string, user: any }>;//4
    getUserProfileDetailsService(userId: string): Promise<{ success: boolean, message: string, user: any }>;//3
    changeUserProfileService(formData: FormData, email: string): Promise<{ success: boolean, message: string, user: any }>;//2
    resetPasswordDetails(formData: FormData, userId: string): Promise<{ success: boolean, message: string, user: any }>;//5
    getAllEventService(): Promise<{ success: boolean, message: string, data: any }>;
    generateOtpService(userId: string): Promise<{ success: number }>;
    verifyOtpCheckingService(otp: string, globalOTP: string | number | null): Promise<{ success: boolean, message: string }>
    checkOfferAvailableService(categoryName:string):Promise<{success:boolean,message:string,data:any}>




}