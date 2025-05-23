    import { Request,Response } from "express";
    import { mLoginService } from "../../service/managerService/MloginService";
    import { IMloginService } from "../../service/managerService/IMloginService";
import { EventData, TicketType } from "../../config/enum/dto";
import { EventSeatDetails } from "../../config/enum/dto";

    export class managerEventControllers{
        private managerController:IMloginService;
        constructor(managerServiceInstance:IMloginService){
            this.managerController=managerServiceInstance;
        }
            async createEventPost(req: Request, res: Response): Promise<any> {
                console.log('hai');
                
                try {
                    console.log("Processing manager-specific event logic");
                    const body = JSON.parse(JSON.stringify(req.body));
                    console.log("Normal Object",body);
               
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

                    console.log("checking the data ",address,"bla",files);

                   
                    const formData:EventData = {
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
                     
                   
                        images:files!

                      };
        
                    if (!formData.eventName || !formData.title || !formData.address  || !formData.startDate ||!formData.endDate  ||!formData.destination ||!files) {
                        throw new Error("Missing required fields: EventName, title, address, city,startDate, endDate,destination ,or Image.");
                    }
        
                    const result = await this.managerController.createEventPostService(formData, files);
                    console.log("Event created successfully", result);
        
                    return result;
                } catch (error) {
                    console.error("Error in managerEventControllers:", error);
                    throw new Error("Failed to process manager-specific event logic."); 
                }
            }

            async createEventSeatTypeDetails(req: Request, res: Response): Promise<any> {
                try {
                    console.log("Processing manager-specific event seat Details logic");
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
            
                    console.log("Processed formData:", formData);
            
                    const result = await this.managerController.createEventSeatService(formData, eventId);
                    console.log("Event created successfully", result);
            
                    return result;
                } catch (error) {
                    console.error("Error in managerEventControllers:", error);
                    throw new Error("Failed to process manager-specific event logic.");
                }
            }
            
        async updateEventPost(req: Request, res: Response): Promise<any> {
            console.log('hello');
            
            try {
                console.log("Updating manager-specific event logic");
    
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
    
                const result = await this.managerController.updateEventPostService(formData, formData.images,formData._id);
                console.log("Event created successfully", result);
    
                return result;
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic."); 
            }
        }

        
        async getAllEventData(managerId:string): Promise<any> {
            console.log('hai');
            
            try {
                console.log("Processing manager-specific event logic");
                const result = await this.managerController.getAllEventService(managerId);
                console.log("Event created successfully", result);
    
                return result;
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic.");
            }
        } 
        async getSelectedEventDataService(id:string): Promise<any> {
            console.log('hai');
            
            try {
                console.log("Processing manager-specific event logic");
                const result = await this.managerController.getSelectedEventService(id);
                console.log("Event created successfully", result);
    
                return result;
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic.");
            }
        }
        async getSelectedEventTicketDetails(id:string){
            try {
                console.log("Processing manager-specific event logic");
                const result = await this.managerController.getSelectedEventTicketService(id);
                console.log("Event created successfully", result);
    
                return result;
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic.");
            }
        }
        async postSeatDetails(ticketData:TicketType){
            try {
    
                const result = await this.managerController.postSeatInformationService(ticketData)
                console.log("Event created successfully", result);
                return result;
                
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic.");
            }
        }     

        
    }

    