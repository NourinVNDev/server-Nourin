import { PaymentData, retryPayment } from "../../../dtos/user.dto";

export interface IEventBookingService{
        posthandleLikeService(index:string,userId:string,postId:string):Promise<{result:any}>
        handlePostDetailsService(postId:string):Promise<{result:any}>;
            getBookedEventService(bookingId:string):Promise<{result:any}>;
             makePaymentStripeService(products:PaymentData):Promise<{success: boolean;message: string;data: any;}>;
                 makeRetryPaymentStripeService(products:retryPayment):Promise<{success: boolean;message: string;data: any;}>;
                  getCategoryBasedService(postId:string):Promise<{success:boolean,message:string,user:any}>;


}