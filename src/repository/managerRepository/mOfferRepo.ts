import OFFERDB from "../../models/adminModels/offerSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import { OfferData } from "../../config/enum/dto";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import MANAGERWALLETDB from "../../models/managerModels/managerWalletSchema";
import MANAGEROFFERDB from "../../models/managerModels/managerOffer";
export class managerOfferRepository{
    async getSelectedOfferRepository(offerId:string,managerId:string){
          try {
                 const result = await MANAGEROFFERDB.findById(offerId);
                 const eventNames=await SOCIALEVENTDB.find({Manager:managerId});
                 console.log("DB data", result);
                 return { success: true, message: "Event data retrieved successfully", data: {result,eventNames} };
             } catch (error) {
                 console.error("Error in getEventTypeDataService:", error);
                 return { success: false, message: "Internal server error" };
             }

    }

    async addNewOfferRepository(formData: OfferData) {
        try {
            const { offerName, discount_on, discount_value, startDate, endDate, item_description,managerId } = formData;
    
            const activeOffer = await MANAGEROFFERDB.findOne({
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
            const newOffer = await MANAGEROFFERDB.create({
                offerName,
                discount_on,
                discount_value,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                item_description,
                managerId
            });
    
            console.log("New offer added:", newOffer);
            const socialEvents = await SOCIALEVENTDB.find({Manager:managerId});

            const actualEvents = socialEvents.filter(event => event.title === newOffer.discount_on);
            // console.log("Actual",actualEvents);
            if (actualEvents.length > 0) {
                for (const event of actualEvents) {
            //         console.log("Event:", event);
            //         const offerPercentage = Number(discount_value);
            //         event.typesOfTickets.forEach((ticket) => {
            //             if (ticket.Amount != null) {
            //                 const deductionAmount = (ticket.Amount * offerPercentage) / 100;
            //                 const offerAmount = ticket.Amount - deductionAmount;
                            
    
                            
            //                 ticket.offerDetails = {
            //                     offerPercentage,
            //                     offerAmount,
            //                     deductionAmount,
            //                     isOfferAdded: "Offer Added",
            //                 };
            //             }
            //         });
    
                    event.managerOffer = newOffer._id;
    
                 
                    await event.save();
                }
            }

            const allOffers = await MANAGEROFFERDB.find();
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
    
        
            const existingOffer = await MANAGEROFFERDB.findOne({ discount_on });
            console.log("Checking from Repo", existingOffer);
    
            if (!existingOffer) {
                return {
                    success: false,
                    message: `Offer with name '${offerName}' not found.`,
                };
            }
    
            const discountValueAsNumber = Number(discount_value);
    
            if (isNaN(discountValueAsNumber)) {
                return {
                    success: false,
                    message: "Discount value is invalid.",
                };
            }
    
            const startDateParsed = new Date(startDate);
            const endDateParsed = new Date(endDate);
    
            if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
                return {
                    success: false,
                    message: "Invalid date format.",
                };
            }

            const updatedOffer = await MANAGEROFFERDB.findOneAndUpdate(
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
                { new: true } 
            );
    
            if (!updatedOffer) {
                return {
                    success: false,
                    message: "Failed to update offer.",
                };
            }
    
            const socialEvents = await SOCIALEVENTDB.find({ eventName: discount_on });
            const actualEvents=await socialEvents.filter((event)=>event.eventName===updatedOffer.discount_on);
    
            if (actualEvents.length > 0) {
                for (const event of actualEvents) {
                    console.log("Event:", event);
    
            //         const offerPercentage = discountValueAsNumber;
            //         event.typesOfTickets.forEach((ticket) => {
            //             if (ticket.Amount != null) {
            //                 const deductionAmount = (ticket.Amount * offerPercentage) / 100;
            //                 const offerAmount = ticket.Amount - deductionAmount;
    
                         
            //                 ticket.offerDetails = {
            //                     offerPercentage,
            //                     offerAmount,
            //                     deductionAmount,
            //                     isOfferAdded: "Offer Added",
            //                 };
            //             }
            //         });
    
                    event.managerOffer = updatedOffer._id;
    
             
                    await event.save();
                }
            }
    
            console.log("Updated Offer:", updatedOffer);
    
            const result = await MANAGEROFFERDB.find();
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

  async fetchManagerWalletRepository(managerId:string){
            try{
            const managerWallet=await MANAGERWALLETDB.findOne({managerId:managerId}).populate('managerId');
            console.log(managerWallet)
            return {
            success: true,
            message: "Retrive Manager Wallet successfully",
            data: managerWallet,
            };
        } catch (error) {
            console.error("Error canceling event:", error);
            return {
            success: false,
            message: "Error occurred during canceling event",
            data: null,
            };
        }

  }
}