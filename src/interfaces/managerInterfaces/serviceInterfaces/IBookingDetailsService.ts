export interface IBookingDetailsService{
       getTodaysBookingService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
           getTotalBookingService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
              getBookedUserService(managerName:string):Promise<{success:boolean,message:string,data:any}>;
          

}