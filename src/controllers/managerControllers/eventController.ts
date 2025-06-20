import { injectable, inject } from "inversify";
import TYPES from "../../inversify/types";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
import { Request, Response } from "express-serve-static-core";
import { IManagerEventService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerEventService";
import { EventData, EventSeatDetails } from "../../dtos/user.dto";
@injectable()
export class ManagerEventController {
    constructor(
        @inject(TYPES.IManagerEventService) private _eventService: IManagerEventService
    ) { }

    async createEventPost(req: Request, res: Response): Promise<void> {
        console.log("Received request for creating an event");
        console.log(req.body, "Yeah", req.file);

        try {
            if (!req.file) {
                console.log('Mahn')
                res.status(HTTP_statusCode.BadRequest).json({ error: response_message.CREATEEVENTPOSTIMAGE_FAILED });
                return;
            }
            const body = JSON.parse(JSON.stringify(req.body));
            console.log("Normal Object", body);

            const {
                _id,
                eventName,
                title,
                content,
                time,
                tags,
                address,
                startDate,
                endDate,
                amount,
                destination,
                companyName
            } = body;

            const files = req.file;

            console.log("checking the data ", address, "bla", files);


            const formData: EventData = {
                _id,
                companyName,
                content,
                time,
                tags,
                eventName,
                title,
                address,
                startDate,
                endDate,
                amount,
                destination,


                images: files!

            };

            if (!formData.eventName || !formData.title || !formData.address || !formData.startDate || !formData.endDate || !formData.destination || !files) {
                throw new Error("Missing required fields: EventName, title, address, city,startDate, endDate,destination ,or Image.");
            }

            const savedEvent = await this._eventService.createEventPostService(formData, files);
            if (savedEvent.success) {
                res.status(HTTP_statusCode.OK).json({
                    message: response_message.CREATEEVENTPOST_SUCCESS,
                    data: savedEvent.data,
                });
            } else {
                res.json({ message: response_message.CREATEEVENTPOST_FAILED, data: null }
                )
            }


        } catch (error) {
            console.error("Error in createEventPost:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEEVENTPOST_ERROR });
        }
    }
    async createEventSeatDetails(req: Request, res: Response): Promise<void> {

        console.log(req.body, "yes", req.params);

        try {

            const body = req.body;
            console.log("Normal Object", body);

            const eventId = req.params.eventId;
            console.log("EventID:", eventId);


            if (!Array.isArray(body)) {
                throw new Error("Invalid data format: Expected an array");
            }

            const formData: EventSeatDetails = body.map((item: any) => ({
                amount: Number(item.Amount),
                typesOfTickets: item.typesOfTickets,
                noOfSeats: Number(item.noOfSeats),
                Included: Array.isArray(item.Included) ? item.Included : [],
                notIncluded: Array.isArray(item.notIncluded) ? item.notIncluded : [],
            }));

            console.log("Processed formData:", formData)
            const savedEvent = await this._eventService.createEventSeatService(formData, eventId);
            if (savedEvent.success) {
                res.status(HTTP_statusCode.OK).json({
                    message: response_message.GETCATEGORYDETAILS_SUCCESS,
                    data: savedEvent.data,
                });
            } else {
                res.json({ message: response_message.CREATEEVENTPOST_FAILED, data: null }
                )
            }


        } catch (error) {
            console.error("Error in createEventPost:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEEVENTPOST_ERROR });
        }

    }
    async getAllEventDetails(req: Request, res: Response): Promise<void> {
        try {
            const managerId = req.params.managerId;
            const result = await this._eventService.getAllEventService(managerId);
            if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                    message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
            }
            res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLEVENTDETAILS_SUCCESS,
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
    async getSelectedEventDetails(req: Request, res: Response): Promise<void> {
        try {

            const { id } = req.params;
            const result = await this._eventService.getSelectedEventService(id);


            if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                    message: result?.message || response_message.GETALLOFFERS_FAILED,
                });
            }


            res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLEVENTDETAILS_SUCCESS,
                data: result.data,
            });
        } catch (error) {
            console.error("Error in fetching event:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    async fetchEventTicketDetails(req: Request, res: Response) {
        try {

            const { id } = req.params;
            const result = await this._eventService.getSelectedEventTicketService(id);


            if (!result?.success) {
                res.status(HTTP_statusCode.InternalServerError).json({
                    message: result?.message || "Failed to fetch event ticket",
                });
            }


            res.status(HTTP_statusCode.OK).json({
                message: response_message.GETALLEVENTDETAILS_SUCCESS,
                data: result.data,
            });
        } catch (error) {
            console.error("Error in event ticket fetching:", error);
            res.status(HTTP_statusCode.InternalServerError).json({
                message: response_message.FETCHADMINDASHBOARDDATA_ERROR,
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async updateEventPost(req: Request, res: Response): Promise<void> {

        console.log(req.body, "Yeah", req.files);
        try {
                 const body = JSON.parse(JSON.stringify(req.body));
                console.log("Req body",req.files);
              
                const files =req.files as Express.Multer.File[]||[''];
                console.log("Checking the multer  file",files);
                
                const {
                    _id,
                    eventName,
                    title,
                    content,
                    time='',
                    tags,
                    address,
                    startDate,
                    endDate,
                    destination,
                    amount,
                    companyName} = body;



                  console.log("Checking CompanyName:",companyName)

                  if (!eventName || !title || !address ) {
                    throw new Error("Missing required fields or files.");
                  }
                 
                  const formData: EventData = {
                    _id, companyName, content, time, tags, eventName, title,
                    address, startDate, endDate, 
                    destination,
                    amount,
                    images: files,
                  };
                console.log("checking the data ",formData,formData.images);
                
                  console.log("Body",body);
                  
                if (!formData.eventName || !formData.title || !formData.address || !formData.startDate ||!formData.endDate  ||!formData.destination  ||!files) {
                    throw new Error("Missing required fields: EventName, title, address,startDate, endDate,amount,destination,noOfDays,noOfPerson,Included,notIncluded,or Image.");
                }


            const savedEvent = await this._eventService.updateEventPostService(formData, formData.images,formData._id);
            if (savedEvent.success) {
                res.status(HTTP_statusCode.OK).json({
                    message: response_message.UPDATEEVENTPOST_SUCCESS,
                    data: savedEvent.data,
                });
            } else {
                res.json({ message: response_message.CREATEEVENTPOST_FAILED, data: null }
                )
            }


        } catch (error) {
            console.error("Error in createEventPost:", error);
            res.status(HTTP_statusCode.InternalServerError).json({ error: response_message.CREATEEVENTPOST_ERROR });
        }
    }
        async updateSeatInformation(req:Request,res:Response){
            try {
              console.log("Req body:",req.body);
              
              const TicketData= req.body;
              console.log("your companyNames:",TicketData);
      
              const result = await this._eventService.postSeatInformationService(TicketData);
              res.status(200).json(result);
          } catch (error) {
              console.error("Error while checking manager status:", error);
              res.status(500).json({
                  success: false,
                  error: response_message.ADMINLOGIN_ERROR
              });
          }
          }


}