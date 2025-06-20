import { OfferData } from "../../dtos/user.dto";
import { IAdminOfferRepo } from "../../interfaces/adminInterfaces/repositoryInterfaces/IAdminOfferRepo";
import OFFERDB from "../../models/adminModels/adminOfferSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
export class AdminOfferRepository implements IAdminOfferRepo{
        async addNewOfferRepo(formData: OfferData) {
        try {
            const { offerName, discount_on, discount_value, startDate, endDate, item_description, managerId } = formData;
            const existingOfferByName = await OFFERDB.findOne({ offerName });
            if (existingOfferByName) {
                return {
                    success: false,
                    message: `Offer with the name "${offerName}" already exists.`,
                    data: [],
                };
            }



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
            const socialEvents = await SOCIALEVENTDB.find({ Manager: managerId });

            const actualEvents = socialEvents.filter(event => event.title === newOffer.discount_on);
            console.log("Actual", actualEvents);
            if (actualEvents.length > 0) {
                for (const event of actualEvents) {
                    console.log("Event:", event);
                    const offerPercentage = Number(discount_value);
                    event.typesOfTickets.forEach((ticket) => {
                        if (ticket.Amount != null) {
                            const deductionAmount = (ticket.Amount * offerPercentage) / 100;
                            const offerAmount = ticket.Amount - deductionAmount;



                            ticket.offerDetails = {
                                offerPercentage,
                                offerAmount,
                                deductionAmount,
                                isOfferAdded: "Offer Added",
                            };
                        }
                    });

                    event.adminOffer = newOffer._id;


                    await event.save();
                }
            }

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
          async getAllOfferRepo(){
        try {
            const result = await OFFERDB.find(); 
            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: result };
        } catch (error) {
            console.error("Error in getEventTypeDataService:", error);
            return { success: false, message: "Internal server error" };
        }
    }
        async getSelectedOfferRepo(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
      try {
            const result = await OFFERDB.findById(offerId); // Fetch data from the database
            const category = await CATEGORYDB.find();
            console.log("DB data", result);
            return { success: true, message: "Event data retrieved successfully", data: { result, category } };
      } catch (error) {
          console.error("Error in getEventTypeDataService:", error);
          return { success: false, message: "Internal server error" };
      }
    }
        async updateOfferDetailsRepo(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const {
                offerName,
                discount_on,
                discount_value,
                startDate,
                endDate,
                item_description,
            } = formData;


            const existingOffer = await OFFERDB.findOne({ discount_on });
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
                { new: true }
            );

            if (!updatedOffer) {
                return {
                    success: false,
                    message: "Failed to update offer.",
                };
            }

            const socialEvents = await SOCIALEVENTDB.find({ title: discount_on });
            const actualEvents = await socialEvents.filter((event) => event.title === updatedOffer.discount_on);

            if (actualEvents.length > 0) {
                for (const event of actualEvents) {
                    console.log("Event:", event);

                    const offerPercentage = discountValueAsNumber;
                    event.typesOfTickets.forEach((ticket) => {
                        if (ticket.Amount != null) {
                            const deductionAmount = (ticket.Amount * offerPercentage) / 100;
                            const offerAmount = ticket.Amount - deductionAmount;


                            ticket.offerDetails = {
                                offerPercentage,
                                offerAmount,
                                deductionAmount,
                                isOfferAdded: "Offer Added",
                            };
                        }
                    });

                    event.adminOffer = updatedOffer._id;


                    await event.save();
                }
            }

            console.log("Updated Offer:", updatedOffer);

            const result = await OFFERDB.find();
            console.log("All offers from DB:", result);

            return {
                success: true,
                message: "Offer updated successfully.",
                data: result,
            };
        }
       catch (error) {
          console.error("Error in getEventTypeDataService:", error);
          return { success: false, message: "Internal server error" };
      }
    }

}