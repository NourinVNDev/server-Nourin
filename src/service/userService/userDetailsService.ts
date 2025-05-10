import { loginRepo } from "../../repository/userRepository/loginRepo";
import { billingData, PaymentData, retryBillingData, retryPayment } from "../../config/enum/dto";
import Stripe from "stripe";
import { IloginRepo } from "../../repository/userRepository/IloginRepo";
import { eventNames } from "node:process";
const Stripe_Secret=process.env.STRIPE_SERVER_SECRET
if(!Stripe_Secret){
throw new Error("Stripe Secret from .env file not found!")
}
require("dotenv").config();

const stripe = new Stripe(Stripe_Secret);

export class userDetailsService{
    private loginRepository:IloginRepo;

    constructor(userRepositoryInstance:IloginRepo){
        this.loginRepository=userRepositoryInstance;
    }
    async postLikeService(index:string,userId:string,postId:string){
        try {
            console.log("Processing event data in another service...",index,userId,postId);
  
            // Perform additional validations if needed
            if ( !userId || !postId) {
                throw new Error("Index and userId are required for liking  the post.");
            }
  
            // Call repository to save the data
            const savedEvent =await this.loginRepository.posthandleLikeForPost(index,userId,postId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }


    async getPostDetailsService(postId:string){
        try {
            console.log("Processing event data in another service...",postId);
  
            // Perform additional validations if needed
            if (!postId) {
                throw new Error("There is no postId.");
            }
  
            // Call repository to save the data
            const savedEvent =await this.loginRepository.getPostDetailsRepo(postId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }


    async getSelectedEventService2(postId:string){
        try {
            console.log("Processing event data in another service...",postId);
  
            if (!postId) {
                throw new Error("Id.");
            }
            const savedEvent =await this.loginRepository.getSelectedEventRepo(postId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }
    async getCancelBookingEventService2(bookingId:string){
        try{
            if (!bookingId) {
                throw new Error("bookingId.");
            }
            const savedEvent =await this.loginRepository.getCancelBookingRepo(bookingId);
  
            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

        async makePaymentStripeService2(product: PaymentData) {
            console.log("Product from Service", product);
        
            try {
                console.log("Processing event data in another services...",product.bookedId);
        
                if (!product) {
                    throw new Error("Invalid product provided.");
                }
                const result=await this.loginRepository.checkSeatAvailable(product)
                if(!result.success){
                    return {success:false,message:result.message,data:result.data};
                }
                const actualAmount=product.Amount||product.amount/product.noOfPerson;
        
                const lineItem = {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: product.eventName, 
                            images: product.images,
                        },
                        unit_amount: Math.round(actualAmount * 100),
                    },
                    quantity: product.noOfPerson,
                };
        
               
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [lineItem], 
                    mode: "payment",
                    success_url: `http://localhost:5173/payment-success/${product.managerId}`,
                    cancel_url: `http://localhost:5173/payment-cancel/${product.bookedId}`,
                });

                const paymentStatus = session ? "Success" : "Cancelled";

                console.log("Payment Details:",paymentStatus);
                

                // Store payment data in MongoDB
                const paymentData = {
                    ...product,
                    sessionId: session.id,
                    paymentStatus,
                };
        
                const bookingData=await this.loginRepository.savePaymentData(paymentData);
        
          
        
                return {success:true,message:'Payment completed Successfully',data:session.id,output:{bookingData,eventName:product.eventName}};
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            }
        }
        async makeRetryPaymentStripeService2(product:retryPayment){
            try {
                console.log("Processing event data in another services...",product.bookedId);
        
                if (!product) {
                    throw new Error("Invalid product provided.");
                }
                const result=await this.loginRepository.checkRetrySeatAvailable(product)
                if(!result.success){
                    return {success:false,message:result.message,data:result.data};
                }
                const actualAmount=product.amount/product.noOfPerson;
        
                const lineItem = {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: product.eventName, 
                            images: product.images,
                        },
                        unit_amount: Math.round(actualAmount * 100),
                    },
                    quantity: product.noOfPerson,
                };
        
               
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [lineItem], 
                    mode: "payment",
                    success_url: `http://localhost:5173/payment-success/${product.managerId}`,
                    cancel_url: `http://localhost:5173/payment-cancel/${product.bookedId}`,
                });

                const paymentStatus = session ? "Success" : "Cancelled";

                console.log("Payment Details:",paymentStatus);
                const paymentData = {
                    ...product,
                    sessionId: session.id,
                    paymentStatus,
                };
        
                const bookingData=await this.loginRepository.saveRetryPaymentData(paymentData);
        
          
        
                return {success:true,message:'Payment completed Successfully',data:session.id,output:{bookingData,eventName:product.eventName}};
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            }
        }






        async saveBillingDetailsService2(formData:billingData){
            try {
                console.log("Processing event data in another service...",formData);
                const savedEvent =await this.loginRepository.saveBillingDetailsRepo(formData);
      
                return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            }
        }
        async saveRetryBillingService2(formData:retryBillingData){
                      try {
                const savedEvent =await this.loginRepository.saveRetryBillingRepo(formData);
      
                return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            }
        }
        async updatePayementStatusService2(bookedId:string){
            try {
                console.log("We are going to update the Payment Status of the booked Events...",bookedId);
      
                // Perform additional validations if needed
             
      
                // Call repository to save the data
                const savedEvent =await this.loginRepository.updatePaymentStatusRepo(bookedId);
                if(savedEvent){
                    return {success:savedEvent.success,message:savedEvent.message};
                }
     
            } catch (error) {
                console.error("Error in handleEventCreation:", error);
                throw new Error("Failed to create event in another service layer.");
            } 
        }
        
        
    

    







    

}