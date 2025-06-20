import { FormData, OfferData } from "../../../dtos/user.dto";

export interface IAdminOfferService{
        postNewOfferService(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
            getAllOfferService():Promise<{success:boolean,message:string,data?:any}>
                 getSelectedOfferService(offerId:string):Promise<{success:boolean,message:string,data?:any}>
                   updateOfferService(formData:FormData):Promise<{success:boolean,message:string,data?:any}>

}