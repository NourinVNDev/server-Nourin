import { Response,Request} from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../inversify/types";
import { IEventBookingService } from "../../interfaces/userInterfaces/serviceInterfaces/IEventBookingService";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
 @injectable()
export class EventBookingController{
    constructor(
        @inject(TYPES.IEventBookingService) private _eventBookingService:IEventBookingService
    ){}
   

    
    async handleLikeForPost(req:Request,res:Response){
        try {
       const index  =req.body.index;
    const userId=req.body.userId;
    const postId=req.body.postId;
    console.log('cat',userId,index,postId); 
            const result = await this._eventBookingService.posthandleLikeService(index,userId,postId)
            console.log("Event created successfully", result);
             
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message:response_message.POSTHANDLELIKE_SUCCESS,
         data: {result}
      });
            
        } catch (error) {
                 console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
        } 
    }
    async getPostDetails(req:Request,res:Response){
  try {
    const postId=req.params.postId;
      const result = await this._eventBookingService.handlePostDetailsService(postId); // No res here, just the result

    
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}
async getSelectedEventDetails(req:Request,res:Response){
  try {
    const postId=req.params.id;
      const result = await this._eventBookingService.getBookedEventService(postId); // No res here, just the result
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}
async makePaymentStripe(req: Request, res: Response) {
  try {
    const { products } = req.body;
      const result = await this._eventBookingService.makePaymentStripeService(products);

    if (!result.success) {
      res.status(HTTP_statusCode.OK).json({
        message: result.message,
        success: true,
      });
      return;
    }
    console.log("Checking server-side", result);

    res.status(HTTP_statusCode.OK).json({
      message: response_message.GETPOSTDETAILS_SUCCESS,
      sessionId: result.data,
      success:true
    });
    return;
  }catch (error) {
    console.error("Error in payment doing:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ 
      message: response_message.FETCHADMINDASHBOARDDATA_ERROR, 
      error 
    });
    return;
  }
} 
async makerRetryPayment(req:Request,res:Response){
  try {
    const { products } = req.body;
    console.log("Logging",products.bookedEmails);
    
    const result = await this._eventBookingService.makeRetryPaymentStripeService(products);

    if (!result.success) {
      res.status(HTTP_statusCode.OK).json({
        message: result.message,
        success: true,
      });
      return;
    }
    
   


    console.log("Checking server-side", result);

    res.status(HTTP_statusCode.OK).json({
      message:response_message.GETPOSTDETAILS_SUCCESS,
      sessionId: result.data,
      success:true
    });
    return;

  } catch (error) {
    console.error("Error in getCategoryDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ 
      message: response_message.FETCHADMINDASHBOARDDATA_ERROR, 
      error 
    });
    return;
  }

}

    async getAnEventDetails(req: Request, res: Response): Promise<void|any> {
    try {
      console.log("Findd",req.params);
      
      const postId  =req.params.postId;
      console.log('cat',postId);
        const result = await this._eventBookingService.getCategoryBasedService(postId);
        console.log("Result",result);

     
        if (!result.success) {
            return res.status(HTTP_statusCode.InternalServerError).json({
                message: result.message
            });
        }

        res.status(HTTP_statusCode.OK).json({
            message: response_message.GETMANAGERPROFILEDETAILS_SUCCESS,
            data: result  
        });

    } catch (error) {
        console.error("Error in getCategoryDetails:", error);
        res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
}

async saveBillingDetails(req: Request, res: Response) {
  try {
    const formData = req.body;
    console.log("Received billing details:", formData);

    const result = await this._eventBookingService.saveBillingDetailsService(formData);
    console.log("Nice",result.data)

    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
  }
}
async saveRetryBillingDetails(req:Request,res:Response){
    try {
    const formData = req.body;
    console.log("Received  Retry billing details:", formData);

    const result = await this._eventBookingService.saveRetryBillingService(formData);
  

    res.status(HTTP_statusCode.OK).json(result);
  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
  }
}

async updateBookedEventPaymentStatus(req:Request,res:Response){
  try {
    console.log("Hello from controller");
    
    const bookedId=req.params.bookedId;
    console.log("Updating payment status of booked Event:", bookedId);

    const result = await this._eventBookingService.updatePaymentStatusService(bookedId);
    if(result){
      console.log("Nice",result)

      res.status(HTTP_statusCode.OK).json(result); 
    }

  } catch (error) {
    console.error("Error in saveBillingDetails:", error);
    res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR });
  }
}
async fetchSavedBookingdata(req:Request,res:Response){
  try {
    const bookingId=req.params.bookingId;
      const result = await this._eventBookingService.getBookedEventService(bookingId); 
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message: response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }
}

async checkIfUserValid(req:Request,res:Response){
  console.log("aaa",req.params);
  
    try {
      console.log("Yeah",req.params);
      
    const email=req.params.email;
    const eventName=req.params.eventName;
    const bookedId=req.params.bookedId;
    console.log("Email,EventName",email,eventName);
      const result = await this._eventBookingService.checkBookedUserValidService(email,eventName,bookedId); 
      if (!result) {
           res.status(HTTP_statusCode.InternalServerError).json({
              message:response_message.ADMINLOGIN_ERROR
          });
      }

      res.status(HTTP_statusCode.OK).json({
          message:response_message.GETPOSTDETAILS_SUCCESS,
          data: result
      });

  } catch (error) {
      console.error("Error in get selected event:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
  }

}


}