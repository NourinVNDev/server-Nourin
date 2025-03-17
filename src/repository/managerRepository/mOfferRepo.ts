import OFFERDB from "../../models/managerModels/offerSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import { OfferData } from "../../config/enum/dto";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
export class managerOfferRepository{
    async getSelectedOfferRepository(offerId:string){
          try {
                 const result = await OFFERDB.findById(offerId); // Fetch data from the database
                 const category=await CATEGORYDB.find();
                 console.log("DB data", result);
                 return { success: true, message: "Event data retrieved successfully", data: {result,category} };
             } catch (error) {
                 console.error("Error in getEventTypeDataService:", error);
                 return { success: false, message: "Internal server error" };
             }

    }

    async addNewOfferRepository(formData: OfferData) {
        try {
            const { offerName, discount_on, discount_value, startDate, endDate, item_description } = formData;
    
            const activeOffer = await OFFERDB.findOne({
                discount_on,
                endDate: { $gt: new Date() },
            });
    
            if (activeOffer) {
                return {
                    success: false,
                    message: `An active offer already exists for "${discount_on}".`,
                    data: [],
                };
            }
    
            // Create new offer
            const newOffer = await OFFERDB.create({
                offerName,
                discount_on,
                discount_value,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                item_description,
            });
    
            console.log("New offer added:", newOffer);
    
            // Fetch all related SocialEvents
            const socialEvents = await SOCIALEVENTDB.find({ title: discount_on });
    
            if (socialEvents.length > 0) {
                for (const event of socialEvents) {
                    console.log("Event:", event);
    
                    const offerPercentage = Number(discount_value);
                    event.typesOfTickets.forEach((ticket) => {
                        if (ticket.Amount != null) {
                            const deductionAmount = (ticket.Amount * offerPercentage) / 100;
                            const offerAmount = ticket.Amount - deductionAmount;
    
                            // Update each ticket with offer details
                            ticket.offerDetails = {
                                offerPercentage,
                                offerAmount,
                                deductionAmount,
                                isOfferAdded: "Offer Added",
                            };
                        }
                    });
    
                    event.offer = newOffer._id;
    
                    // Save the updated event
                    await event.save();
                }
            }
    
            // Fetch all offers from DB
            const allOffers = await OFFERDB.find();
            console.log("All offers:", allOffers);
    
            return {
                success: true,
                message: "Offer added successfully and data retrieved.",
                data: allOffers,
            };
        } catch (error) {
            console.error("Error in addNewOfferRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    
    

    
    async updateOfferRepository(formData: OfferData): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const {
                offerName,
                discount_on,
                discount_value,
                startDate,
                endDate,
                item_description,
            } = formData;
    
            // Check if the offer exists
            const existingOffer = await OFFERDB.findOne({ discount_on });
            console.log("Checking from Repo", existingOffer);
    
            if (!existingOffer) {
                return {
                    success: false,
                    message: `Offer with name '${offerName}' not found.`,
                };
            }
    
            // Ensure discount_value is a number
            const discountValueAsNumber = Number(discount_value);
    
            if (isNaN(discountValueAsNumber)) {
                return {
                    success: false,
                    message: "Discount value is invalid.",
                };
            }
    
            // Ensure valid dates
            const startDateParsed = new Date(startDate);
            const endDateParsed = new Date(endDate);
    
            if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
                return {
                    success: false,
                    message: "Invalid date format.",
                };
            }
    
            // Update the existing offer
            const updatedOffer = await OFFERDB.findOneAndUpdate(
                { discount_on },
                {
                    $set: {
                        offerName,
                        discount_value: discountValueAsNumber,
                        startDate: startDateParsed,
                        endDate: endDateParsed,
                        item_description,
                    },
                },
                { new: true } // Return updated document
            );
    
            if (!updatedOffer) {
                return {
                    success: false,
                    message: "Failed to update offer.",
                };
            }
    
            // Fetch all related SocialEvents
            const socialEvents = await SOCIALEVENTDB.find({ title: discount_on });
    
            if (socialEvents.length > 0) {
                for (const event of socialEvents) {
                    console.log("Event:", event);
    
                    const offerPercentage = discountValueAsNumber;
                    event.typesOfTickets.forEach((ticket) => {
                        if (ticket.Amount != null) {
                            const deductionAmount = (ticket.Amount * offerPercentage) / 100;
                            const offerAmount = ticket.Amount - deductionAmount;
    
                            // Update each ticket with offer details
                            ticket.offerDetails = {
                                offerPercentage,
                                offerAmount,
                                deductionAmount,
                                isOfferAdded: "Offer Added",
                            };
                        }
                    });
    
                    event.offer = updatedOffer._id;
    
                    // Save the updated event
                    await event.save();
                }
            }
    
            console.log("Updated Offer:", updatedOffer);
    
            // Fetch all updated offers from the database
            const result = await OFFERDB.find();
            console.log("All offers from DB:", result);
    
            return {
                success: true,
                message: "Offer updated successfully.",
                data: result,
            };
        } catch (error) {
            console.error("Error in updateOfferRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    
  
      async getSearchOfferInput(searchData:string):Promise<{ success: boolean; message: string; data?: any }>{
        try {
               const result = await OFFERDB.findById(searchData); // Fetch data from the database
               const category=await CATEGORYDB.find();
               console.log("DB data", result);
               return { success: true, message: "Event data retrieved successfully", data: {result,category} };
           } catch (error) {
               console.error("Error in getEventTypeDataService:", error);
               return { success: false, message: "Internal server error" };
           }

  }
}