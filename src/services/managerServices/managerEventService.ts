import { inject, injectable } from "inversify";
import TYPES from "../../inversify/types";
import { IManagerEventRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IManagerEventRepo";
import { IManagerEventService } from "../../interfaces/managerInterfaces/serviceInterfaces/IManagerEventService";
import { EventData, eventLocation, EventSeatDetails, TicketType } from "../../dtos/user.dto";
import { uploadToCloudinary } from "../../config/cloudinary.config";
import { getCoordinates } from "../../utils/getCoordinates.util";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
@injectable()
export class ManagerEventService implements IManagerEventService{
    constructor(
        @inject(TYPES.IManagerEventRepo) private _eventRepo:IManagerEventRepo
    ){}

        async createEventPostService(formData: EventData, file: Express.Multer.File): Promise<{ success: boolean; message: string; data?: any }> {
      try {
          console.log("Validating and processing event data...");
          if (!formData.eventName) {
              return { success: false, message: "Event name is required." };
          }
  
          console.log("Checking files", file);
          const fileName = await uploadToCloudinary(file);
          console.log("Uploaded file name", fileName);
          let location:eventLocation|null=null;
          if(formData.title!='Virtual' && formData.address!=null){
            location=await getCoordinates(formData.address);
            console.log("Location",location);
          }else{
            location=null
          }

               if (!formData.title || !formData.startDate || !formData.endDate) {
              throw new Error("Title and date are required for event creation.");
          }
   

    
          const isAllowed = await this._eventRepo.postEventRepository(formData,location, fileName as string);
          
          if (!isAllowed.success) {
              return { success: false, message: "Event validation failed in another service." };
          }
  
          return { success: true, message: "Event created successfully", data: isAllowed.data };
      } catch (error) {
          console.error("Error in createEventPostService:", error);
          return { success: false, message: "Failed to process event data in service layer." };
      }
  }
    async createEventSeatService(formData:EventSeatDetails,eventId:string):Promise<{ success: boolean; message: string; data?: any }>{
    try {
    
      console.log("EventID from Service:",eventId,formData);
      
      if (!eventId) {
          return { success: false, message: "EventId is not Found." };
      }

      const isAllowed = await this._eventRepo.postEventSeatRepository(formData,eventId);
      
      if (!isAllowed.success) {
          return { success: false, message: "Event validation failed in another service." };
      }

      return { success: true, message: "Event created successfully", data: isAllowed.data };
  } catch (error) {
      console.error("Error in createEventPostService:", error);
      return { success: false, message: "Failed to process event data in service layer." };
  }
  }
  async getAllEventService(managerId:string) {
  try {
    const result = await this._eventRepo.getAllEventRepo(managerId);

     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {
 
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getSelectedEventService(id:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const result = await this._eventRepo.getSelectedEventRepo(id);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async getSelectedEventTicketService(id:string){
  try {

    const result = await this._eventRepo.getSelectedEventTicketRepo(id);
    console.log("from service", result);
     return { success: result.success, message: result. message, data: result.data };

  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

  async updateEventPostService(formData: EventData,fileNames: Express.Multer.File[],eventId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        console.log("Validating and processing event data...");

        // Upload files to Cloudinary
        const uploadedFileUrls = await Promise.all(
            fileNames.map(async (file) => {
                console.log('Files', file);
                return await uploadToCloudinary(file); // Upload directly using the Multer file
            })
        );

        console.log("Uploaded file URLs:", uploadedFileUrls);
        let location:eventLocation|null=null;
        if(formData.title!='Virtual' && formData.address!=null){
          location=await getCoordinates(formData.address);
        }

         if (!formData.title || !formData.startDate || !formData.endDate) {
            throw new Error("Title and date are required for event creation.");
        }
      
   

        // Use another service for extended logic
        const isAllowed = await this._eventRepo.postUpdateEventRepository(
            formData,
            uploadedFileUrls as string[], // Assuming Cloudinary returns string URLs
            eventId,location
        );

        if (!isAllowed.success) {
            return { success: false, message: "Event validation failed in another service." };
        }

        return { success: true, message: "Event updated successfully", data: isAllowed.data };
    } catch (error) {
        console.error("Error in updateEventPostService:", error);
        return { success: false, message: "Failed to process event data in service layer." };
    }
}
async postSeatInformationService(ticketData:TicketType){
  const verifierData = await this._eventRepo.updateSeatInformationRepo(ticketData); 

  if (verifierData.success) {
      return {
          success: verifierData.success,
          message: verifierData.message,
          data: verifierData.data
      };
  } else {
      return {
          success: false,
          message: verifierData.message,
          data: verifierData.data
      };
  }
}
  



}