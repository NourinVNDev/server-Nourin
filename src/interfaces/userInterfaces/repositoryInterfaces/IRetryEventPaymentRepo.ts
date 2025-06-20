export interface IRetryEventRepo{
       
            cancelBookedEventRepo(bookingId:string,userId:string):Promise<{success:boolean,message:string,data:any}>
                fetchUserWalletRepo(userId:string):Promise<{success:boolean,message:string,data:any}>
}