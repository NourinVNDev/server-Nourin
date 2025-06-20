import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { Request,Response } from "express";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import { IRetryEventService } from "../../interfaces/userInterfaces/serviceInterfaces/IRetryEventPaymentService";
@injectable()
export class RetryEventPaymentController{
    constructor(
        @inject(TYPES.IRetryEventService) private _retryEventPayment:IRetryEventService
    ){}

    async cancelBookingEvent(req:Request,res:Response){
  try {
    const bookedId=req.params.bookingId;
    const userId=req.params.userId;

    console.log("Check the bookedId",bookedId);

    const savedEvent = await this._retryEventPayment.cancelBookingEventService(bookedId,userId);
    if(savedEvent.success){
      res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
      return;
      }
       res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
  } catch (error) {
    console.error("Error in check cancel booking:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
    
  }
}
  async fetchUserWallet(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this._retryEventPayment.fetchUserWalletService(userId);
      if(savedEvent.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Wallet:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
      
    }

  }


}