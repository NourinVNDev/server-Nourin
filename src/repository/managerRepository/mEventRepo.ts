import { EventData, eventLocation, EventSeatDetails, TicketType } from "../../config/enum/dto";
import MANAGERDB from "../../models/managerModels/managerSchema";
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import { Request, Response } from "express";
import { format } from "date-fns";
import OFFERDB from "../../models/managerModels/offerSchema";
import { log } from "node:util";
export class managerEventRepository {

    async createEventData(formData: EventData, location: eventLocation|null, fileName?: string) {
        try {
            if (!formData.address) {
                throw new Error("Invalid location data: Missing address.");
            }
    
            console.log("Processing event data in actual repository...", formData);
    
            // Fetch manager details
            const manager = await MANAGERDB.findOne({ firmName: formData.companyName });
            if (!manager) {
                throw new Error(`Manager not found for company name: ${formData.companyName}`);
            }
    
            console.log("Manager Details:", manager);
    
            // Check if event name already exists
            const isEventNamePresent = await SOCIALEVENTDB.findOne({ eventName: formData.eventName });
            if (isEventNamePresent) {
                return { success: false, message: "Event Name is already Present" };
            }
    
            // Format dates and calculate no. of days
            const formattedStartDate = format(new Date(formData.startDate), "MM/dd/yyyy");
            const formattedEndDate = format(new Date(formData.endDate), "MM/dd/yyyy");
    
            const noOfDays = Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
    
            // Fetch offer details if available
            const offerDetails = await OFFERDB.findOne({ discount_on: formData.title });
    
            // Create event object
            let event;
            if(formData.title!='Virtual' && location!=null){
              event= new SOCIALEVENTDB({
                    Manager: manager._id,
                    title: formData.title,
                    eventName: formData.eventName,
                    companyName: formData.companyName,
                    content: formData.content || "",
                    address: formData.address.split(' ').slice(0, 4).join(' '),
                    location: { type: 'Point', coordinates: location.coordinates },
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    noOfDays,
                    time: formData.time || "",
                    images: fileName ? [fileName] : [],
                    tags: formData.tags || [],
                    destination: formData.destination,
                    offer: offerDetails?._id || undefined 
                });
            }else{
                 event= new SOCIALEVENTDB({
                    Manager: manager._id,
                    title: formData.title,
                    eventName: formData.eventName,
                    companyName: formData.companyName,
                    content: formData.content || "",
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    noOfDays,
                    time: formData.time || "",
                    images: fileName ? [fileName] : [],
                    tags: formData.tags || [],
                    offer: offerDetails?._id || undefined, 
                    amount:formData.amount
                });
        
            
            }
            await event.save(); 
        

            const categoryData=await CATEGORYDB.findOne({categoryName:event.title});
            categoryData?.Events.push(event._id);
            await categoryData?.save();
    
            return { success: true, data: event };
        } catch (error) {
            console.error("Error in createEventData:", error);
            throw new Error("Failed to save event data to MongoDB.");
        }
    }
    

    async createEventSeatInfo(formData: EventSeatDetails, eventId: string) {
        try {
          const eventData = await SOCIALEVENTDB.findById(eventId);
          if (!eventData) throw new Error("Event not found");
      
          const eventWithOffer = await eventData.populate('offer');
          const offerDetails = eventWithOffer.offer as any;
      
          const discountValue = offerDetails?.discount_value
            ? Number(offerDetails.discount_value)
            : 0;
          formData.forEach(ticket => {
            let deductionAmount = 0;
            let offerAmount = ticket.amount;
            let isOfferAdded = "Not Added";
      
            if (discountValue) {
              deductionAmount = Number(((ticket.amount * discountValue) / 100).toFixed(2));
              offerAmount = Number((ticket.amount - deductionAmount).toFixed(2));
              isOfferAdded = "Offer Added";
            }
      
            const ticketData: any = {
              type: ticket.typesOfTickets,
              noOfSeats: ticket.noOfSeats,
              Amount: ticket.amount,
              Included: ticket.Included,
              notIncluded: ticket.notIncluded,
            };
      
            if (discountValue) {
              ticketData.offerDetails = {
                offerPercentage: discountValue,
                deductionAmount,
                offerAmount,
                isOfferAdded,
              };
            }
      
            eventWithOffer.typesOfTickets.push(ticketData);
          });
      
          await eventWithOffer.save();
          console.log("Updated Event Data:", eventWithOffer);
          return { success: true, data: eventWithOffer };
      
        } catch (error) {
          console.error("Error in createEventSeatInfo:", error);
          throw new Error("Failed to save event data to MongoDB.");
        }
      }
      
      




      async updateEventData(formData: EventData, location: eventLocation|null, fileName?: string[], eventId?: string) {
        try {
            console.log("Processing event data in actual repository...", formData);
    
            // Check if event exists
            const existingEvent = await SOCIALEVENTDB.findById(eventId);
            if (!existingEvent) {
                return { success: false, message: "Event not found" };
            }
    
            // Check if the event name is already present (excluding the current event)
            const isEventNamePresent = await SOCIALEVENTDB.findOne({
                eventName: formData.eventName,
                _id: { $ne: eventId }
            });
            if (isEventNamePresent) {
                return { success: false, message: "Event Name is already Present" };
            }
    
            // Calculate days and get offer
            const noOfDays = Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const offer = await OFFERDB.findOne({ discount_on: formData.title });
            const discountValue = offer?.discount_value ? Number(offer.discount_value) : 0;
    
            // Update ticket offers
            existingEvent.typesOfTickets.forEach((ticket: any) => {
                let deductionAmount = 0;
                let offerAmount = ticket.Amount;
                let isOfferAdded = "Not Added";
            
                if (discountValue) {
                    deductionAmount = Number(((ticket.Amount * discountValue) / 100).toFixed(2));
                    offerAmount = Number((ticket.Amount - deductionAmount).toFixed(2));
                    isOfferAdded = "Offer Added";
                }
            
                ticket.offerDetails = discountValue ? {
                    offerPercentage: discountValue,
                    deductionAmount,
                    offerAmount,
                    isOfferAdded,
                } : undefined;
            });
            
    
            // Update event fields
            if(formData.title!='Virtual' && location!=null && formData.address!=null){
                existingEvent.title = formData.title;
                existingEvent.eventName = formData.eventName;
                existingEvent.companyName = formData.companyName;
                existingEvent.content = formData.content || "";
                existingEvent.address = formData.address.split(' ').slice(0, 4).join(' ') || "";
                existingEvent.location = { type: "Point", coordinates: location.coordinates };
                existingEvent.startDate = new Date(formData.startDate);
                existingEvent.endDate = new Date(formData.endDate);
                existingEvent.noOfDays = noOfDays;
                existingEvent.time = formData.time || "";
                existingEvent.destination = formData.destination;
                existingEvent.offer = offer?._id || undefined;
        
              
                if (Array.isArray(fileName) && fileName.length > 0) {
                    existingEvent.images = fileName;
                }

            }else{
                existingEvent.title = formData.title;
                existingEvent.eventName = formData.eventName;
                existingEvent.companyName = formData.companyName;
                existingEvent.content = formData.content || "";
  
                existingEvent.startDate = new Date(formData.startDate);
                existingEvent.endDate = new Date(formData.endDate);
                existingEvent.noOfDays = noOfDays;
                existingEvent.time = formData.time || "";
                existingEvent.amount = Number(formData.amount);
                existingEvent.offer = offer?._id || undefined;
        
              
                if (Array.isArray(fileName) && fileName.length > 0) {
                    existingEvent.images = fileName;
                }
            }
         
    
           
            const updatedEvent = await existingEvent.save();
            console.log("Event updated successfully:", updatedEvent);
    
            await CATEGORYDB.updateMany(
                { Events: updatedEvent._id },
                { $pull: { Events: updatedEvent._id } }
              );
            const category = await CATEGORYDB.findOneAndUpdate(
                { categoryName: formData.title },
                { $addToSet: { Events: updatedEvent._id } },
                { new: true }
            );
    
            if (!category) {
                throw new Error(`Category not found for name: ${formData.title}`);
            }
    
            console.log("Category updated successfully:", category);
            return { success: true, data: updatedEvent };
        } catch (error) {
            console.error("Error in updateEventData:", error);
            return { success: false, message: "Failed to update event data in MongoDB." };
        }
    }
    






    async getAllEventDetailsRepository(managerId: string) {
        try {
            const result = await SOCIALEVENTDB.find({ Manager: managerId }); // Fetch data from the database
            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: result };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }
    }


    async getSelectedEventRepository(id: string) {
        try {
            const result = await SOCIALEVENTDB.findById({ _id: id });
            const category = await CATEGORYDB.find();
            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: { result, category } };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getSelectedEventTicketRepository(id: string) {
        try {
            const result = await SOCIALEVENTDB.findById({ _id: id });

            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: result?.typesOfTickets };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async updateSeatInformationRepository(ticketData: TicketType) {
        console.log("Ticket details from Repo:", ticketData);
        try {
            const socialEvent = await SOCIALEVENTDB.findById(ticketData.id);

            if (!socialEvent) {
                console.log("Social event not found");
                return;
            }
            socialEvent.typesOfTickets.forEach((event: any) => {
                if (event.id === ticketData._id) {
                    event.type = ticketData.type;
                    event.noOfSeats = ticketData.noOfSeats;
                    event.Amount = ticketData.Amount;
                    event.Included = ticketData.Included;
                    event.notIncluded = ticketData.notIncluded;
                }
            });

            await socialEvent.save();
            console.log("Updated social event:", socialEvent);
            return { success: true, message: "Event Seat Updated SuccessFully", data: socialEvent.typesOfTickets };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }
    }

}


