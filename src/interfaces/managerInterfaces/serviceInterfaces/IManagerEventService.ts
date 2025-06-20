import { EventData, EventSeatDetails, TicketType } from "../../../dtos/user.dto";
export interface IManagerEventService{
      createEventPostService(formData:EventData,file:Express.Multer.File):Promise<{success:boolean,message:string,data?:any}> 
          createEventSeatService(formData:EventSeatDetails,eventId:string):Promise<{success:boolean,message:string,data?:any}>
             getAllEventService(managerId:string):Promise<{success:boolean,message:string,data?:any}>
                getSelectedEventService(id:string):Promise<{success:boolean,message:string,data?:any}>
                   getSelectedEventTicketService(id:string):Promise<{success:boolean,message:string,data?:any}>
                      updateEventPostService(formData:EventData,fileNames:Express.Multer.File[],eventId:string):Promise<{success:boolean,message:string,data?:any}>
                         postSeatInformationService(ticket:TicketType):Promise<{success:boolean,message:string,data:any}>;
                      
}