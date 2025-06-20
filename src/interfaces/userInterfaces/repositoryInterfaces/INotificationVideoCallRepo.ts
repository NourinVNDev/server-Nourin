export interface INotificationVideoCallRepo{
        fetchUserNotificationRepo(userId:string):Promise<{success:boolean,message:string,data:any}>
            fetchUserNotificationCountRepo(userId:string):Promise<{success:boolean,message:string,data:any}>

}