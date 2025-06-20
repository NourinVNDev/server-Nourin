import { EventData, eventLocation, EventSeatDetails, TicketType } from "../../../dtos/user.dto";

export interface IManagerEventRepo{
        postEventRepository(formData:EventData,location:eventLocation|null,fileName:string):Promise<{ success: boolean;  data?:any|undefined; }>
            postEventSeatRepository(formData:EventSeatDetails,eventId:string):Promise<{ success: boolean; data?:any; }>
                getAllEventRepo(managerId:string):Promise<{ success: boolean; message: string; data?:any; }>
                getSelectedEventRepo(id:string):Promise<{ success: boolean; message: string; data?: any }>
                    getSelectedEventTicketRepo(id:string):Promise<{ success: boolean; message: string; data?: any }>
                        postUpdateEventRepository(formData:EventData,fileName:string[],eventId:string,location:eventLocation|null):Promise<{ success: boolean; message: string; data:any; }>
                            updateSeatInformationRepo(ticketData:TicketType):Promise<{ success: boolean; message: string; data?: any }>

}