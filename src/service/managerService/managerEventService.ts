import { EventData, eventLocation, EventSeatDetails, TicketType } from "../../config/enum/dto";
import { mLoginRepo } from "../../repository/managerRepository/MloginRepo";
import { IMloginRepo } from "../../repository/managerRepository/IMloginRepo";
import { Request,Response } from "express";
export class managerEventService{
    private managerEventService:IMloginRepo;
    constructor(managerRepositoryInstance:IMloginRepo){
        this.managerEventService=managerRepositoryInstance;
    }
    async createEventPostService(formData: EventData,location:eventLocation, fileName: string) {
      try {
          console.log("Processing event data in another service...");


          if (!formData.title || !formData.startDate || !formData.endDate) {
              throw new Error("Title and date are required for event creation.");
          }

          const savedEvent =await this.managerEventService.postEventRepository(formData,location,fileName);

          return savedEvent;
      } catch (error) {
          console.error("Error in handleEventCreation:", error);
          throw new Error("Failed to create event in another service layer.");
      }
  }
  async createEventSeatService(formData:EventSeatDetails,eventId:string){
    try {

        console.log("Here I am Checking the form Data and eventId",formData,eventId)


        // Call repository to save the data
        const savedEvent =await this.managerEventService.postEventSeatRepository(formData,eventId);

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
  }
  async updateEventPostService(formData: EventData, fileName: string[],eventId:string,location:eventLocation) {
    try {
        console.log("Processing event data in another service...",fileName);

        // Perform additional validations if needed
        if (!formData.title || !formData.startDate || !formData.endDate) {
            throw new Error("Title and date are required for event creation.");
        }

        // Call repository to save the data
        const savedEvent =await this.managerEventService.postUpdateEventRepository(formData,fileName,eventId,location);

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}


  

  async getAllEventDetailsService(managerId:string) {
    try {
        console.log("Processing event data in another service...");



        // Call repository to save the data
        const savedEvent =await this.managerEventService.getAllEventRepo(managerId);

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}

async getSelectedEventService2(id:string) {
    try {
        console.log("Processing event data in another service...");



        // Call repository to save the data
        const savedEvent =await this.managerEventService.getSelectedEventRepo(id);

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}
async getSelectedEventTicketService2(id:string){
    try {
        console.log("Processing event data in another service...");



        // Call repository to save the data
        const savedEvent =await this.managerEventService.getSelectedEventTicketRepo(id);

        return savedEvent;
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer.");
    }
}
async postTicketInformationService2(ticketData:TicketType){
    try {
        console.log("Hello World");
        
        const savedEvent =await this.managerEventService.updateSeatInformationRepo(ticketData); 
        console.log("update Verifier status Data",savedEvent);
    return savedEvent;
    
    } catch (error) {
        console.error("Error in handleEventCreation:", error);
        throw new Error("Failed to create event in another service layer."); 
    }
}







  
   
    }

 

