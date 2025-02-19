    import { Request,Response } from "express";
    import { mLoginService } from "../../service/managerService/MloginService";
    import { IMloginService } from "../../service/managerService/IMloginService";
import { EventData } from "../../config/enum/dto";

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
                        id,
                        eventName,
                        title,
                        content,
                        time='',
                        tags,
                        location,
                        startDate,
                        endDate,
                        amount,
                        destination,
                        noOfPerson,
                        Included,
                        notIncluded,
                        companyName
                      } = body;

                    const files = req.file;

                    console.log("checking the data ",location,"bla",files);

                    const parsedLocation = JSON.parse(location);
                    const formData:EventData = {
                        id,
                        companyName,
                        content,
                        time,
                        tags,
                        eventName,
                        title,
                        location: parsedLocation,
                        startDate,
                        endDate,
                        amount,
                        destination,
                        noOfPerson,
                        Included,
                        notIncluded,
                        images:files!

                      };
        
                    if (!formData.eventName || !formData.title || !formData.location.address || !formData.location.city || !formData.startDate ||!formData.endDate || !formData.amount ||!formData.destination  ||!formData.noOfPerson || !formData.Included ||!formData.notIncluded ||!files) {
                        throw new Error("Missing required fields: EventName, title, address, city,startDate, endDate,amount,destination,noOfPerson,Included,notIncluded,or Image.");
                    }
        
                    const result = await this.managerController.createEventPostService(formData, files);
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
                    id,
                    eventName,
                    title,
                    content,
                    time='',
                    tags,
                    location,
                    startDate,
                    endDate,
                    amount,
                    destination,
                    noOfPerson,
                    Included,
                    notIncluded,
                    companyName
                    
                  } = body;



                  console.log("Checking CompanyName:",companyName)

                  if (!eventName || !title || !location ) {
                    throw new Error("Missing required fields or files.");
                  }
                  const parsedLocation = JSON.parse(location);
                  const formData: EventData = {
                    id, companyName, content, time, tags, eventName, title,
                    location: parsedLocation, startDate, endDate, amount,
                    destination, noOfPerson, Included, notIncluded,
                    images: files,
                  };
                console.log("checking the data ",formData,formData.images);
                


    
                if (!formData.eventName || !formData.title || !formData.location.address || !formData.location.city || !formData.startDate ||!formData.endDate || !formData.amount ||!formData.destination||!formData.noOfPerson || !formData.Included ||!formData.notIncluded ||!files) {
                    throw new Error("Missing required fields: EventName, title, address, city,startDate, endDate,amount,destination,noOfDays,noOfPerson,Included,notIncluded,or Image.");
                }
    
                const result = await this.managerController.updateEventPostService(formData, formData.images,formData.id);
                console.log("Event created successfully", result);
    
                return result;
            } catch (error) {
                console.error("Error in managerEventControllers:", error);
                throw new Error("Failed to process manager-specific event logic."); 
            }
        }

        
        async getAllEventData(req: Request, res: Response): Promise<any> {
            console.log('hai');
            
            try {
                console.log("Processing manager-specific event logic");
                const result = await this.managerController.getAllEventService(req,res);
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

        
    }