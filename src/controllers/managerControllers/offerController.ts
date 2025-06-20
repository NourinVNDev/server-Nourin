import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { Request,Response } from "express";
import response_message from "../../contants/response_message";
import HTTP_statusCode from "../../contants/enums";
import { IManagerOfferService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerOfferService";
@injectable()
export class ManagerOfferController{
    constructor(
        @inject(TYPES.IManagerOfferService) private _offerService:IManagerOfferService
    ){}

           async getAllOffers(req: Request, res: Response): Promise<void> {
            try {
              const managerId=req.params.managerId;
              const result = await this._offerService.getAllOfferService(managerId);
        
           
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message ||response_message.GETALLOFFERS_FAILED,
                });
              }
        
          
              res.status(HTTP_statusCode.OK).json({
                message:response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message:response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }

                async createNewOffer(req: Request, res: Response): Promise<void> {
            try {
            
              console.log(req.body);
              const  formData  = req.body;
              console.log("FormData from Offer", formData);
              const result = await this._offerService.postNewOfferService(formData);
              if (!result?.success) {
                console.log('hai');
                
                res.status(HTTP_statusCode.OK).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
                return;
              }
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
             async getSelectedOfferDetails(req: Request, res: Response): Promise<void> {
            try {

              const {offerId,managerId}=req.params;
              const result = await this._offerService.getSelectedOfferService(offerId,managerId);
        
      
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
      
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }

           async updateOfferDetails(req: Request, res: Response): Promise<void> {
            try {
              console.log(req.body);
              const formData= req.body;
              console.log("FormData from Offer", formData);
              const result = await this._offerService.updateOfferService(formData);
              if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
                return;
              }
          
              // Respond with the fetched data
              res.status(HTTP_statusCode.OK).json({
                message: response_message.UPDATEOFFERDETAILS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message:response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }
          }
         async getSearchOfferUserInput(req:Request,res:Response):Promise<void>{
            try {
                   const searchData=req.params.searchData;
        console.log("SearchDaata:",searchData);
              const result = await this._offerService.getSearchOfferInputService(searchData);
        
              if (!result?.success) {
                 res.status(HTTP_statusCode.InternalServerError).json({
                  message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
              }
        
              console.log("Result Data:",result);
              res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLOFFERS_SUCCESS,
                data: result.data,
              });
            } catch (error) {
              console.error("Error in getAllOffers:", error);
              res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
              });
            }

            

          }
            async fetchManagerWallet(req:Request,res:Response){
            try {
  
              const managerId=req.params.managerId;
          
              console.log("Chech the managerId",managerId);
          
              const savedEvent = await this._offerService.fetchManagerWalletService(managerId);
              if(savedEvent.success){
                res.status(HTTP_statusCode.OK).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
                return;
                }
                 res.status(HTTP_statusCode.NoChange).json({ success: savedEvent.success, message: savedEvent.message, data: savedEvent.data });
            } catch (error) {
              console.error("Error in check  Manager Wallet:", error);
              res.status(HTTP_statusCode.InternalServerError).json({ success: false, message: response_message.FETCHADMINDASHBOARDDATA_ERROR});
              
            }
          }


}