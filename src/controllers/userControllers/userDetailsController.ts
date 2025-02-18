import { loginServices } from "../../service/userService/loginService";
import { billingData, PaymentData } from "../../config/enum/dto";
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

    async saveBillingDetails2(formData:billingData) {
        try {
          const result = await this.loginServices.saveBillingDetailsService(formData);
          console.log("Event created successfully", result);
          return { success: result.success, message: result.message, data: result };
        } catch (error) {
          console.error("Error saving billing details:", error);
          return { success: false, message: "Failed to save billing details", data: null };
        }
      }



    

    

}