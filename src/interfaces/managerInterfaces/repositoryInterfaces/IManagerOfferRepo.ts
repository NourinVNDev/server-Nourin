import { OfferData } from "../../../dtos/user.dto";

export interface IManagerOfferRepo{
      getAllOfferRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>
          postOfferRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
              getSelectedOfferRepo(offerId:string,managerId:string):Promise<{ success: boolean; message: string; data?: any }>
                  updateOfferDetailsRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
                  getSearchOfferInputRepo(searchData:string):Promise<{ success: boolean; message: string; data?: any }>
                      fetchManagerWalletRepo(managerId:string):Promise<{success:boolean,message:string,data:any}>
          

}