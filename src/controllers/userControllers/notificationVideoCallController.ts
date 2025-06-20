import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { INotificationVideoCallService } from "../../interfaces/userInterfaces/serviceInterfaces/INotificationVideoCallService";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import { Request,Response } from "express";
@injectable()
export class NotificationVideoCallController{
    constructor(
        @inject(TYPES.INotificationVideoCallService) private _notificationVideoCallService:INotificationVideoCallService
    ){}
      async fetchUserNotification(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this._notificationVideoCallService.fetchUserNotificationService(userId);
      if(savedEvent.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
      
    }
  }

    async fetchNotificationCount(req:Request,res:Response){
    try {
  
      const userId=req.params.userId;
  
      console.log("Chech the userId",userId);
  
      const savedEvent = await this._notificationVideoCallService.fetchUserNotificationCountService(userId);
      if(savedEvent.success){
        res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
        return;
        }
         res.status(HTTP_statusCode.NotFound).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
    } catch (error) {
      console.error("Error in check User Notification:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
      
    }

  }


}