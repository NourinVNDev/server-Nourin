import { OfferData } from "../../../dtos/user.dto";

export interface IAdminOfferRepo{
          addNewOfferRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>
                getAllOfferRepo():Promise<{ success: boolean; message: string; data?: any }>
                      getSelectedOfferRepo(offerId:string):Promise<{ success: boolean; message: string; data?: any }>
                        updateOfferDetailsRepo(formData:OfferData):Promise<{ success: boolean; message: string; data?: any }>

}