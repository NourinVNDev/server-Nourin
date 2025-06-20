import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import { Request,Response } from "express";
import { IAdminOfferService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminOfferService";
@injectable()
export class AdminOfferController{
    constructor(
        @inject( TYPES.IAdminOfferService) private _offerService:IAdminOfferService
    ){}

       async createNewOffer(req: Request, res: Response){
              try {
              
                console.log(req.body);
                const  formData  = req.body;
                console.log("FormData from Offer", formData);
                const result = await this._offerService.postNewOfferService(formData);
                if (!result?.success) {
              
                  
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
         async getAllOffers(req: Request, res: Response): Promise<void> {
                        try {
                       
                          const result = await this._offerService.getAllOfferService();
                    
                       
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

                    async getSelectedOfferDetails(req: Request, res: Response): Promise<void> {
            try {

              const {offerId}=req.params;
              const result = await this._offerService.getSelectedOfferService(offerId);
        
      
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
                    
                        // Check if the result indicates a failure
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



}