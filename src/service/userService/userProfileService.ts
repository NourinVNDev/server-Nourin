import { loginRepo } from "../../repository/userRepository/loginRepo";
import { FormData } from "../../config/enum/dto";
import { IloginRepo } from "../../repository/userRepository/IloginRepo";
import { uploadToCloudinary } from "../../config/cloudinaryConfig";
export class userProfileService{
    private loginRepository:IloginRepo;
    constructor(userRepositoryInstance:IloginRepo){
        this.loginRepository=userRepositoryInstance;
    }
    async postReviewRating(formData: FormData) {
        try {
            console.log("Processing event data in another service...", formData);
    
            // Check if review and rating are present
            if (!formData.review || !formData.rating) {
                console.error("Missing review or rating.");
                throw new Error("Review and Rating are required for liking the post.");
            }
    
           
            if (!formData.eventId || !formData.userId) {
                console.error("Missing eventId or userId:", formData);
                throw new Error("EventId and userId are required for liking the post.");
            }
    

            console.log("Valid form data:", formData);
    
        
            const savedEvent = await this.loginRepository.handleReviewRatingRepo(formData);
            console.log("Saved event:", savedEvent);
    
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }
    
    async getEventHistoryService2(){
        try {
            console.log("Processing event data in another service...",);
  
            // Perform additional validations if needed
         
            // Call repository to save the data
            const savedEvent =await this.loginRepository.getEventHistoryRepo();
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }


    


    async getExistingReviewService2(userId:string,eventId:string){
        try {
            console.log("Processing of getting review and rating in another service...");
  
            const savedEvent =await this.loginRepository.getExistingReviewRepo(userId,eventId);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

    async getEventBookedService2(){
        try {
            console.log("Processing event data in another service...",);
  
            // Perform additional validations if needed
         
            // Call repository to save the data
            const savedEvent =await this.loginRepository.getEventBookedRepo();
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }


    

    async getBookedManagerService2(userId:string){
        try {
            console.log("Processing Booked Manager data in another service...",);
  
            // Perform additional validations if needed
         
            // Call repository to save the data
            const savedEvent =await this.loginRepository.getManagerDataRepo(userId);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }


    }


    async createChatSchemaService2(userId:string,manager:string){
        try {
            console.log("Processing create chat Schema in another service...",);
  
            // Perform additional validations if needed
         
            // Call repository to save the data
            const savedEvent =await this.loginRepository.createChatSchemaRepo(userId,manager);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }


    }
    async uploadUserProfileService2(userId:string,profilePicture:Express.Multer.File){
        try {
            console.log("Processing create chat Schema in another service...",);
  
            // Perform additional validations if needed

            const fileName=await uploadToCloudinary(profilePicture);
         
            // Call repository to save the data
            const savedEvent =await this.loginRepository.uploadUserProfilePictureRepo(userId,fileName as string);
            return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
          
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }


    


    


    
}