export interface IBookingDetailsRepo{
        getTodaysBookingRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>;
            getTotalBookingRepo(managerId:string):Promise<{success:boolean,message:string,data?:any}>;
                getUserDataRepo(managerName:string):Promise<{success:boolean,message:string,data:any}>;
       

}