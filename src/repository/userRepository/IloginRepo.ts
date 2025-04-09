import { billingData, FormData,PaymentData } from "../../config/enum/dto";
export interface IloginRepo{
    isEmailPresent(email:string):Promise<{user:boolean}>;
    getEventDataRepo():Promise<{success:boolean,message:string,data:any}>;
    postUserData(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    checkLogin(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    googleAuthData(payload:Object):Promise<{success:boolean,message:string,user:any}>;
    isEmailValid(email:string):Promise<{success:boolean,message:string,user:any}>;
    resetPasswordRepo(userId:string,formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    fetchuserEmail(userId:string):Promise<{success:boolean,message:string,user:any}>
    resetUserProfile(email:string,formData:FormData):Promise<{success:boolean,message:string,user:any}>
    getAllCategoryRepository():Promise<{success:boolean,message:string,category:any}>
    getUserDetailsRepository(userId:string):Promise<{success:boolean,message:string,user?:any,category?:any}>
    getCategoryBasedRepo(postId:string):Promise<{success:boolean,message:string,category:any}>
    getAllEventBasedRepo():Promise<{success:boolean,message:string,category:any[]}>
    getCategoryTypeRepo(categoryName:string):Promise<{success:boolean,message:string,category:any}>
    posthandleLikeForPost(index:string,userId:string,postId:string):Promise<{savedEvent:any}>
    getPostDetailsRepo(postId:string):Promise<{savedEvent:any}>
    getSelectedEventRepo(postId:string):Promise<{savedEvent:any}>
    checkSeatAvailable(product:PaymentData):Promise<{success:boolean,message:string,data?:any|undefined|null}>
    savePaymentData(paymentData:PaymentData):Promise<{success:boolean,message:string,data:any}>
    saveBillingDetailsRepo(formData:billingData):Promise<{success:boolean,message:string,data:any}>
    updatePaymentStatusRepo(bookedId:string):Promise<{success:boolean,message:string}|undefined>
    handleReviewRatingRepo(formData:FormData):Promise<{savedEvent:any}>
    getEventHistoryRepo(userId:string):Promise<{success:boolean,message:string,data:any}>
    getExistingReviewRepo(userId:string,eventId:string):Promise<{success:boolean,message:string,data:any}>
    getEventBookedRepo(userId:string):Promise<{success:boolean,message:string,data:any}>
    getManagerDataRepo(userId:string):Promise<{success:boolean,message:string,data:any}>
    createChatSchemaRepo(userId:string,manager:string):Promise<{success:boolean,message:string,data:any}>
    checkOfferAvailableRepo(categoryName:string):Promise<{success:boolean,message:string,data:any}>
    uploadUserProfilePictureRepo(userId:string,profilePicture:string):Promise<{success:boolean,message:string,data:any}>
    cancelBookedEventRepo(bookingId:string,userId:string):Promise<{success:boolean,message:string,data:any}>
    fetchUserWalletRepo(userId:string):Promise<{success:boolean,message:string,data:any}>


}