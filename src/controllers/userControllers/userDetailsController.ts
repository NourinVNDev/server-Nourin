import { loginServices } from "../../service/userService/loginService";
import { billingData, PaymentData, retryBillingData, retryPayment } from "../../config/enum/dto";
import { ILoginService } from "../../service/userService/ILoginService";
export class userDetailsController{
    private loginServices:ILoginService;
    constructor(userServiceInstance:ILoginService){
        this.loginServices=userServiceInstance;
    }



    async handleLikeForPost(index:string,userId:string,postId:string){
        try {

            const result = await this.loginServices.posthandleLikeForPost(index,userId,postId)
            console.log("Event created successfully", result);
            return {result};
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }


    async handlePostDetails(postId:string){
        try {

            const result = await this.loginServices.handlePostDetailsService(postId)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }
    
    async getSelectEventController(postId:string){
        try {

            const result = await this.loginServices.getSelectedEventService(postId)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }
    async getSelectedBookingData(bookingId:string){
        try {

            const result = await this.loginServices.getBookedEventService(bookingId)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }
    async checkUserIsBooked(email:string,eventName:string){
                try {

            const result = await this.loginServices.checkBookedUserValidService(email,eventName)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }

    async makePaymentStripeController(products:PaymentData){
        try {

            const result = await this.loginServices.makePaymentStripeService(products)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }
    async makeRetryPaymentStripeController(products:retryPayment){
        try {

            const result = await this.loginServices.makeRetryPaymentStripeService(products)
            console.log("Event created successfully", result);
            return result;
            
        } catch (error) {
            console.error("Error in managerEventControllers:", error);
            throw new Error("Failed to process manager-specific event logic.");
        } 
    }

    async saveBillingDetails2(formData:billingData) {
        try {
          const result = await this.loginServices.saveBillingDetailsService(formData);
          console.log(" save data  successfully", result);
          return { success: result.success, message: result.message, data: result };
        } catch (error) {
          console.error("Error saving billing details:", error);
          return { success: false, message: "Failed to save billing details", data: null };
        }
      }

      async saveRetryBillingDetails2(formData:retryBillingData){
           try {
          const result = await this.loginServices.saveRetryBillingService(formData);
          console.log("Retry saving Data successfully", result);
          return { success: result.success, message: result.message, data: result };
        } catch (error) {
          console.error("Error saving billing details:", error);
          return { success: false, message: "Failed to save billing details", data: null };
        }
      }

      async updatePaymentStatus(bookedId:string){
        try {
            const result = await this.loginServices.updateBookedEventPaymentStatus(bookedId);
            console.log("Event created successfully", result);
            if(result){
                return { success: result.success, message: result.message};
            }
          
          } catch (error) {
            console.error("Error saving billing details:", error);
            return { success: false, message: "Failed to save billing details", data: null };
          }
      }



    

    

}