import { OfferData } from "../../../dtos/user.dto"

export interface IManagerOfferService{
        getAllOfferService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
           postNewOfferService(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
              getSelectedOfferService(offerId:string,managerId:string):Promise<{success:boolean,message:string,data?:any}>
                     updateOfferService(formData:OfferData):Promise<{success:boolean,message:string,data?:any}>
                        getSearchOfferInputService(searchData:string):Promise<{success:boolean,message:string,data?:any}>
                           fetchManagerWalletService(managerId:string):Promise<{success:boolean,message:string,data:any}>
}