import { EventData } from "../../config/enum/dto";
import MANAGERDB from "../../models/managerModels/managerSchema";
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import { Request,Response } from "express";
import { format } from "date-fns";
export class managerEventRepository {

    async createEventData(formData: EventData, fileName?: string) {
        try {
            if (!formData.location || !formData.location.address || !formData.location.city) {
                throw new Error("Invalid location data: Missing address or city.");
            }
            

            console.log("Processing event data in actual repository...", formData);
    
            // Fetch manager details
            const manager = await MANAGERDB.findOne({ firmName: formData.companyName });
            if (!manager) {
                throw new Error(`Manager not found for company name: ${formData.companyName}`);
            }
            console.log("Manager Detsils:",manager);
            
    
            // Format dates
            const formattedStartDate = format(new Date(formData.startDate), "MM/dd/yyyy");
            const formattedEndDate = format(new Date(formData.endDate), "MM/dd/yyyy");
    
            // Check if event name exists
            const isEventNamePresent = await SOCIALEVENTDB.findOne({ eventName: formData.eventName });
            if (isEventNamePresent) {
                return { success: false, message: "Event Name is already Present" };
            }
    
            // Structure the event data
            const event = new SOCIALEVENTDB({
                Manager: manager._id,
                title: formData.title,
                eventName: formData.eventName,
                companyName: formData.companyName,
                content: formData.content || "",
                location: {
                    address: formData.location.address,
                    city: formData.location.city,
                },
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                noOfPerson: formData.noOfPerson,
                noOfDays: formData.noOfDays,
                Amount: formData.amount,
                Included: formData.Included,
                notIncluded: formData.notIncluded,
                time: formData.time || "",
                images: fileName ? [fileName] : [],
                tags: formData.tags || [],
                destination: formData.destination,
            });
    
            // Save to the database
            const savedEvent = await event.save();
            console.log("Event saved successfully:", savedEvent);
    
            // Update category with event ID
            const category = await CATEGORYDB.findOneAndUpdate(
                { categoryName: formData.title },
                { $push: { Events: savedEvent._id } },
                { new: true }
            );
    
            if (!category) {
                throw new Error(`Category not found for name: ${formData.title}`);
            }
    
            console.log("Category updated successfully:", category);
    
            return { success: true, data: savedEvent };
        } catch (error) {
            console.error("Error in createEventData:", error);
            throw new Error("Failed to save event data to MongoDB.");
        }
    }


    // async updateEventData(formData: EventData, fileName?: string,eventId?:string) {
    //     try {
       
    //         console.log("Processing event data in actual repository...", formData);
    
          
            
    
    //         // Format dates
    //         const formattedStartDate = format(new Date(formData.startDate), "MM/dd/yyyy");
    //         const formattedEndDate = format(new Date(formData.endDate), "MM/dd/yyyy");
    
    //         // Check if event name exists
    //         const isEventNamePresent = await SOCIALEVENTDB.findOne({ eventName: formData.eventName });
    //         if (isEventNamePresent) {
    //             return { success: false, message: "Event Name is already Present" };
    //         }

    //         const presentedEvents=await SOCIALEVENTDB.findOne({_id:eventId});
    
    //         // Structure the event data
    //         const event = new SOCIALEVENTDB({
               
    //             title: formData.title,
    //             eventName: formData.eventName,
    //             companyName: formData.companyName,
    //             content: formData.content || "",
    //             location: {
    //                 address: formData.address,
    //                 city: formData.city,
    //             },
    //             startDate: formattedStartDate,
    //             endDate: formattedEndDate,
    //             noOfPerson: formData.noOfPerson,
    //             noOfDays: formData.noOfDays,
    //             Amount: formData.amount,
    //             Included: formData.Included,
    //             notIncluded: formData.notIncluded,
    //             time: formData.time || "",
    //             images: fileName ? [fileName] : [],
    //             tags: formData.tags || [],
    //             destination: formData.destination,
    //         });
    
    //         // Save to the database
    //         const savedEvent = await event.save();
    //         console.log("Event saved successfully:", savedEvent);
    
    //         // Update category with event ID
    //         const category = await CATEGORYDB.findOneAndUpdate(
    //             { categoryName: formData.title },
    //             { $push: { Events: savedEvent._id } },
    //             { new: true }
    //         );
    
    //         if (!category) {
    //             throw new Error(`Category not found for name: ${formData.title}`);
    //         }
    
    //         console.log("Category updated successfully:", category);
    
    //         return { success: true, data: savedEvent };
    //     } catch (error) {
    //         console.error("Error in createEventData:", error);
    //         throw new Error("Failed to save event data to MongoDB.");
    //     }
    // }


    async updateEventData(formData: EventData, fileName?: string[], eventId?: string) {
        try {
            console.log("Processing event data in actual repository...", formData);
    
            // Check if the event exists
            const existingEvent = await SOCIALEVENTDB.findById(eventId);
            if (!existingEvent) {
                return { success: false, message: "Event not found" };
            }
    
            console.log("Existing Event picture", existingEvent.images, fileName);
    
            // Check if the event name is already present (excluding the current event)
            const isEventNamePresent = await SOCIALEVENTDB.findOne({ eventName: formData.eventName, _id: { $ne: eventId } });
            if (isEventNamePresent) {
                return { success: false, message: "Event Name is already Present" };
            }
    
            // Update the event data
            existingEvent.title = formData.title;
            existingEvent.eventName = formData.eventName;
            existingEvent.companyName = formData.companyName;
            existingEvent.content = formData.content || "";
            existingEvent.location = {
                address: formData.location.address,
                city: formData.location.city,
            };
            existingEvent.startDate = new Date(formData.startDate);
            existingEvent.endDate = new Date(formData.endDate);
            existingEvent.noOfPerson = formData.noOfPerson;
            existingEvent.noOfDays = formData.noOfDays;
            existingEvent.Amount = formData.amount;
            existingEvent.Included[0] = formData.Included; // Replace the entire array
            existingEvent.notIncluded[0] = formData.notIncluded; // Replace the entire array
            existingEvent.time = formData.time || "";
    
            // Update images only if new images are provided
            if (Array.isArray(fileName) && fileName.length > 0) {
                existingEvent.images = fileName; // Replace with new images
            }
    
            // Save the updated event
            const updatedEvent = await existingEvent.save();
            console.log("Event updated successfully:", updatedEvent);
    
            // Update category with event ID if necessary
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




    
    
    async getAllEventDetailsRepository(req:Request,res:Response){
   try {
    const result = await SOCIALEVENTDB.find(); // Fetch data from the database
    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
} catch (error) {
    console.error("Error in getEventTypeDataService:", error);
    return { success: false, message: "Internal server error" };
}
    }


    async getSelectedEventRepository(id:string){
        try {
         const result = await SOCIALEVENTDB.findById({_id:id}); // Fetch data from the database
         const category=await CATEGORYDB.find();
         console.log("DB data", result);
         return { success: true, message: "Event data retrieved successfully", data: {result,category} };
     } catch (error) {
         console.error("Error in getEventTypeDataService:", error);
         return { success: false, message: "Internal server error" };
     }
         }
     
    
}


