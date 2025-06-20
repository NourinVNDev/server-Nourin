import { retryPayment } from "../../../dtos/user.dto";

export interface IStripeRepo{
     saveRetryPaymentData(paymentData:retryPayment):Promise<{success:boolean,message:string,data:any}>
      handleCancelPayment(bookingId:string):Promise<void>

    
}