import { FormData } from "../../../dtos/user.dto";
import { Request,Response } from "express";
export interface IManagerLoginService{
       CheckingEmail(email:string):Promise<boolean|string>;
           managerVerifyService(formData:FormData,otp:string,globalOTP:string|number|null):Promise<{success:boolean;message:string;user:any|null}>; 
               managerLoginService(formData:FormData):Promise<{success:boolean;message:string;user:any|undefined}>;
                   managerForgotEmail(email:string):Promise<{success:boolean,message:string,otpValue:string|null}>;
                       verifyOtpForForgot(email:string,otp:string,globalOTP:string|number|null):Promise<{success:boolean,message:string}>
                           resetPasswordDetailsForManager(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user:any}>;
                               getEventTypeDataService(req:Request):Promise<{success:boolean,message:string,data?:any}>
                                   getManagerProfileService(companyName:string):Promise<{success:boolean,message:string,data?:any}>
                                       updateManagerProfileService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
                                           updateManagerPasswordService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>
                                              fetchNotificationOfManagerService(managerId:string):Promise<{success:boolean,message:string,data:any}>;
                                                 fetchAllEventService(companyName:string):Promise<{success:boolean,message:string,data:any}>
                                                    getUserCountAndRevenueService(managerId:string):Promise<{success:boolean,message:string,data:any}>;
                                                       getDashboardGraphService(managerId:string,selectedType:string,selectedTime:string):Promise<{success:boolean,message:string,data:any}>;
                                                          getDashboardPieChartService(managerId:string):Promise<{success:boolean,message:string,data:any}>;
                                                            getDashboardBarChartService(selectedEvent:string):Promise<{success:boolean,message:string,data:any}>;
                                                               NotificationCountOfManagerService(managerId:string):Promise<{success:boolean,message:string,data:any}>;
                                                                  checkValidDate(eventName:string):Promise<{success:boolean,message:string,data:any}>;
                                                                     fetchEventNameService(managerId:string):Promise<{success:boolean,message:string,data:any}>;



}