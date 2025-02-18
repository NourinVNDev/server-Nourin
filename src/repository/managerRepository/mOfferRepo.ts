import OFFERDB from "../../models/managerModels/offerSchema";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import { OfferData } from "../../config/enum/dto";
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
          const existingOffer = await OFFERDB.findOne({ offerName });
  
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
              { offerName },
              {
                  $set: {
                      discount_on,
                      discount_value: discountValueAsNumber,
                      startDate: startDateParsed, // Ensure correct date format
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