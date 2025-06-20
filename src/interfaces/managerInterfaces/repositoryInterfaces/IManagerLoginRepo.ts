import { FormData } from "../../../dtos/user.dto";
import { Request,Response } from "express";

export interface IManagerLoginRepo{
        isEmailPresentRepo(email:string):Promise<boolean>;
    postUserDataRepo(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    checkManagerLoginRepo(formData:FormData):Promise<{success:boolean,message:string,user:any}>;
    isManagerEmailValidRepo(email:string):Promise<{success:boolean,message:string,user:any}>;
    resetPasswordRepoForManagerRepo(email:string,password:string,password1:string):Promise<{success:boolean,message:string,user?:any}>;
        getEventTypeDataRepo(req:Request):Promise<{success:boolean,message:string,data?:any}>;
            getManagerProfileRepo(companyName:string):Promise<{success:boolean,message:string,data?:any}>;
             updateManagerProfileRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
                 updateManagerPasswordRepo(formData:FormData):Promise<{success:boolean,message:string,data?:any}>;
                     fetchManagerNotificationRepo(managerId:string):Promise<{success:boolean,message:string,data?:any|null}>
                         fetchAllCompanyEventRepo(companyName:string):Promise<{success:boolean,message:string,data:any}>
                             fetchUserCountAndRevenueRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>
                                 fetchDashboardGraphRepo(managerId:string,selectedType:string,selectedTime:string):Promise<{success:boolean,message:string,data?:any}>
                                     fetchDashboardPieChartRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>
                                         fetchDashboardBarChartRepo(selectedEvent:string):Promise<{success:boolean,message:string,data?:any}>
                                             fetchManagerNotificationCountRepo(managerId:string):Promise<{success:boolean,message:string,data?:any|null}>
                                                 checkValidDateRepo(eventName:string):Promise<{success:boolean,message:string,data?:any|null}>
                                                     fetchEventNamesRepo(managerId:string):Promise<{success:boolean,message:string,data?:any|null}>
                                                     

}