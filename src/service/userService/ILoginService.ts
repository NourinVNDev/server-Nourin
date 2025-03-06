import { FormData, PaymentData } from "../../config/enum/dto";
import { billingData } from "../../config/enum/dto";
export interface ILoginService{
    getAllEventService():Promise<{success:boolean,message:string,data:any[]}>;
    CheckingEmail(email:string):Promise<{success:number|boolean|string}> ;
    verifyService(formData:FormData,otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string,user:any}>;
    loginDetails(formData:FormData):Promise<{success:boolean,message:string,  user?: any | null,categoryName?: any|null}>;
    generateOtpService(userId:string):Promise<{success:number}>;
    verifyOtpCheckingService(otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string}>
    CheckingEmailForResendOtp(email:string):Promise<{success:number|boolean|string}>;
    GoogleAuth(AuthData:string):Promise<{success:boolean,message:string,user:any}>;
    forgotEmailDetails(email: string): Promise<{ success: boolean; message: string; otpValue: string | null }>;
    verifyForgotOtpService(otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string}>;
    resetPasswordDetails(formData:FormData,email:string):Promise<{success:boolean,message:string,user:any}>;
    GoogleAuth(AuthData:string):Promise<{success:boolean,message:string,user:any}>;
    changeUserProfileService(formData:FormData,email:string):Promise<{success:boolean,message:string,user:any}>;
    getWholeCategoryDetails():Promise<{success:boolean,message:string,user:any}>;
    getUserProfileDetailsService(userId:string):Promise<{success:boolean,message:string,user:any}>;
    getCategoryBasedServiice(postId:string):Promise<{success:boolean,message:string,user:any}>;
    getAllEventServiice():Promise<{success:boolean,message:string,user:any}>;
    getCategoryTypeServiice(categoryName:string):Promise<{success:boolean,message:string,user:any}>;
    posthandleLikeForPost(index:string,userId:string,postId:string):Promise<{result:any}>
    handlePostDetailsService(postId:string):Promise<{result:any}>;
    getSelectedEventService(postId:string):Promise<{result:any}>;
    makePaymentStripeService(products:PaymentData):Promise<{result:any}>;
    posthandleReviewRating(formData:FormData):Promise<{result:any}>;
    saveBillingDetailsService(formData:billingData):Promise<{success:boolean,message:string,data:any}>
    updateBookedEventPaymentStatus(bookedId:string):Promise<{success:boolean,message:string}>
    getExistingReviewService(userId:string,eventId:string):Promise<{success:boolean,message:string,data: string | null | undefined | any}>
    getEventHistoryService():Promise<{success:boolean,message:string,data: string | null | undefined | any  |number}>;
    getEventBookedService():Promise<{success:boolean,message:string,data: string | null | undefined | any  |number}>;
    getBookedManagerService(userId:string):Promise<{success:boolean,message:string,data:any}>;
    createChatSchemaService(formData:FormData):Promise<{success:boolean,message:string,data:any}>;
    uploadUserProfilePhoto(userId:string,profilePicture:Express.Multer.File):Promise<{success:boolean,message:string,data:any}>;
    checkOfferAvailableService(categoryName:string):Promise<{success:boolean,message:string,data:any}>

}