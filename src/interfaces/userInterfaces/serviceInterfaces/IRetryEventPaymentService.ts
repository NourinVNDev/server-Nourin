export interface IRetryEventService{
     cancelBookingEventService(bookingId:string,userId:string):Promise<{success:boolean,message:string,data:any}>
         fetchUserWalletService(userId:string):Promise<{success:boolean,message:string,data:any}>
}