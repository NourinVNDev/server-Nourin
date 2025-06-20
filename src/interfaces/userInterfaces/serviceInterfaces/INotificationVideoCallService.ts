export interface INotificationVideoCallService{
fetchUserNotificationService(userId:string):Promise<{success:boolean,message:string,data:any}>
fetchUserNotificationCountService(userId:string):Promise<{success:boolean,message:string,data:any}>
}