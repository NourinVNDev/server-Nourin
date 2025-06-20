import { EventData, eventLocation, EventSeatDetails, TicketType } from "../../dtos/user.dto";
import { IManagerEventRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IManagerEventRepo";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import OFFERDB from "../../models/adminModels/adminOfferSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import { format } from "date-fns";
export class ManagerEventRepository implements IManagerEventRepo{
     async postEventRepository(formData: EventData,location:eventLocation|null, fileName: string) {
        try {

              if (!formData.address) {
                throw new Error("Invalid location data: Missing address.");
            }
    

               const manager = await MANAGERDB.findOne({ firmName: formData.companyName });
            if (!manager) {
                throw new Error(`Manager not found for company name: ${formData.companyName}`);
            }
            
               console.log("Manager Details:", manager);
            const isEventNamePresent = await SOCIALEVENTDB.findOne({ eventName: formData.eventName });
            if (isEventNamePresent) {
                return { success: false, message: "Event Name is already Present" };
            }
            const formattedStartDate = format(new Date(formData.startDate), "MM/dd/yyyy");
            const formattedEndDate = format(new Date(formData.endDate), "MM/dd/yyyy");
    
            const noOfDays = Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
    
            // Fetch offer details if available
            const offerDetails = await OFFERDB.findOne({ discount_on: formData.title });
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
        async   postEventSeatRepository(formData:EventSeatDetails,eventId:string){
         try {
          const eventData = await SOCIALEVENTDB.findById(eventId);
          if (!eventData) throw new Error("Event not found");
      
          const eventWithOffer = await eventData.populate('adminOffer');
          const offerDetails = eventWithOffer.adminOffer as any;
      
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
    async getAllEventRepo(managerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

            const result = await SOCIALEVENTDB.find({ Manager: managerId }); // Fetch data from the database
            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getSelectedEventRepo(id:string): Promise<{ success: boolean; message: string; data?: any }> {
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
async getSelectedEventTicketRepo(id:string){
  try {

            const result = await SOCIALEVENTDB.findById({ _id: id });

            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: result?.typesOfTickets };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

    async postUpdateEventRepository(formData: EventData, fileName: string[],eventId:string,location:eventLocation|null) {
          try {
          // 1. Check if event exists
          console.log("EventId:",eventId);
          const existingEvent = await SOCIALEVENTDB.findById(eventId);
          console.log("Existing",existingEvent);
          
          if (!existingEvent) return { success: false, message: "Event not found",data:[] };
    
    
      
          // 3. Calculate number of days
          const noOfDays = Math.ceil(
            (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );
      
          // 4. Apply offer (if exists)
          const offer = await OFFERDB.findOne({ discount_on: formData.title });
          console.log("Offer",offer);
          
          if (offer) {
            const discountValue = Number(offer.discount_value || 0);
            if (discountValue) {
                existingEvent.typesOfTickets.forEach((ticket: any, index: number) => {
                    if (discountValue) {
                      const deductionAmount = (ticket.Amount * discountValue) / 100;
                      const offerAmount = ticket.Amount - deductionAmount;
                  
                      existingEvent.typesOfTickets[index].offerDetails = {
                        offerPercentage: discountValue,
                        deductionAmount: +deductionAmount.toFixed(2),
                        offerAmount: +offerAmount.toFixed(2),
                        isOfferAdded: "Offer Added",
                      };
                    } else {
                      existingEvent.typesOfTickets[index].offerDetails = undefined;
                    }
                  });
                  existingEvent.markModified("typesOfTickets");
                  
            }
          }
      
          // 5. Update common fields


          console.log("ExistingEvents:",existingEvent);
          Object.assign(existingEvent, {
            title: formData.title,
            eventName: formData.eventName,
            companyName: formData.companyName,
            content: formData.content || "",
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            noOfDays,
            time: formData.time || "",
            offer: offer?._id || undefined,
          });
      
          // 6. Conditional fields (Physical vs Virtual)
          if (formData.title !== "Virtual" && location && formData.address) {
            existingEvent.address = formData.address.split(" ").slice(0, 4).join(" ") || "";
            existingEvent.location = { type: "Point", coordinates: location.coordinates };
            existingEvent.destination = formData.destination;
          } else if (formData.amount !== undefined) {
            existingEvent.amount = Number(formData.amount);
          }
      
          // 7. Update images if provided
          if (Array.isArray(fileName) && fileName.length > 0) {
            existingEvent.images = fileName;
          }
      
          // 8. Save updated event
          const updatedEvent = await existingEvent.save();
      
          // 9. Update event category references
          await CATEGORYDB.updateMany(
            { Events: updatedEvent._id },
            { $pull: { Events: updatedEvent._id } }
          );
      
          await CATEGORYDB.findOneAndUpdate(
            { categoryName: formData.title },
            { $addToSet: { Events: updatedEvent._id } }
          );
      
          return { success: true,  message: "Event successfully saved.",data: updatedEvent };
        } catch (error: any) {
          console.error("Error in updateEventData:", error);
          return { success: false, message: "Failed to update event data." ,data:[]};
        }
  }

async updateSeatInformationRepo(ticketData: TicketType): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const socialEvent = await SOCIALEVENTDB.findById(ticketData.id);

    if (!socialEvent) {
      console.log("Social event not found");
      return {
        success: false,
        message: "Social event not found",
      };
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

    return {
      success: true,
      message: "Event Seat Updated Successfully",
      data: socialEvent.typesOfTickets,
    };
  } catch (error) {
    console.error("Error in updateSeatInformationRepo:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

  
   







}