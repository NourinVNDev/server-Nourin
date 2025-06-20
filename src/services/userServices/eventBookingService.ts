import { inject, injectable } from "inversify";
import TYPES from "../../inversify/types";
import Stripe from "stripe";
import { IEventBookingRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IEventBookingRepo";
import { IEventBookingService } from "../../interfaces/userInterfaces/serviceInterfaces/IEventBookingService";
import { billingData, PaymentData, retryBillingData, retryPayment } from "../../dtos/user.dto";
const Stripe_Secret = process.env.STRIPE_SERVER_SECRET
if (!Stripe_Secret) {
    throw new Error("Stripe Secret from .env file not found!")
}
require("dotenv").config();

const stripe = new Stripe(Stripe_Secret, {
    apiVersion: '2025-05-28.basil',
});

@injectable()
export class EventBookingService implements IEventBookingService{
    constructor(
        @inject(TYPES.IEventBookingRepo) private _eventBookingRepo:IEventBookingRepo
    ){}
    
   async posthandleLikeService(index: string, userId: string, postId: string) {
        try {
            console.log("Processing event data in another service...", index, userId, postId);

            // Perform additional validations if needed
            if (!userId || !postId) {
                throw new Error("Index and userId are required for liking  the post.");
            }

            // Call repository to save the data
            const savedEvent = await this._eventBookingRepo.postHandleLikeRepo(index, userId, postId);

            return savedEvent;
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }

    }

    async handlePostDetailsService(postId:string){
  try {
        if (!postId) {
                throw new Error("There is no postId.");
            }
    
    const result = await this._eventBookingRepo.getPostDetailsRepo(postId);


return {result};
  } catch (error) {
 
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}

async getBookedEventService(bookingId:string){
  try {

    const result = await this._eventBookingRepo.getBookedEventRepo(bookingId);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
  
}

async makePaymentStripeService(products:PaymentData){
  try {

     if (!products) {
                throw new Error("Invalid product provided.");
            }
            const result = await this._eventBookingRepo.checkSeatAvailable(products);

               if (!result.success) {
                return { success: false, message: result.message, data: result.data };
            }
            await this._eventBookingRepo.updateBookingData(products);
               const actualAmount = (products.Amount || products.amount) / products.noOfPerson;
            console.log("Waas",actualAmount);
            console.log("Amm",Math.round(actualAmount * 100));
            const lineItem = {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: products.eventName,
                        images: products.images,
                    },
                    unit_amount: Math.round(actualAmount * 100),
                },
                quantity: products.noOfPerson,
            };

                 const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [lineItem],
                mode: "payment",
                success_url: `http://localhost:5173/payment-success/${products.managerId}/${products.eventName}`,
                cancel_url: `http://localhost:5173/payment-cancel/${products.bookingId}`,
                metadata: {
                    managerId: products.managerId,
                    bookedId: products.bookedId,
                    bookingId: products.bookingId,
                    paymentStatus: products.paymentStatus,
                    userId: products.userId,
                    sessionId: products.sessionId,
                    firstName: products.firstName,
                    lastName: products.lastName,
                    email: products.email,
                    phoneNo: products.phoneNo,
                    address: products.address,
                    images: JSON.stringify(products.images),
                    eventName: products.eventName,
                    location_address: products.location?.address || '',
                    location_city: products.location?.city || '',
                    noOfPerson: products.noOfPerson,
                    noOfDays: products.noOfDays,
                    Amount: products.Amount,
                    type: products.type,
                    Included: JSON.stringify(products.Included),
                    notIncluded: JSON.stringify(products.notIncluded),
                    bookedMembers: JSON.stringify(products.bookedMembers),
                    bookedEmails: JSON.stringify(products.bookedEmails),
                    amount: products.amount,
                    companyName: products.companyName,
                    categoryName:products.categoryName
                }
            });
            return { success: true, message: 'Payment completed Successfully', data: session.id };
  } catch (error) {

    console.error("Error in user  Payment:", error);
    throw new Error("Error in user Payment in  service layer."); 
  }
}
async makeRetryPaymentStripeService(product:retryPayment){
  try {
      if (!product) {
                throw new Error("Invalid product provided.");
            }
            const result = await this._eventBookingRepo.checkRetrySeatAvailable(product)
            if (!result.success) {
                return { success: false, message: result.message, data: result.data };
            }
            const actualAmount = (product.amount ||product.Amount)/ product.noOfPerson;
            console.log("Actual Amount:",actualAmount);
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
                success_url: `http://localhost:5173/payment-success/${product.managerId}/${product.eventName}`,
                cancel_url: `http://localhost:5173/payment-cancel/${product.bookedId}`,
                 metadata: {
                    managerId: product.managerId,
                    bookedId: product.bookedId,
                    bookingId: product.bookingId,
                    paymentStatus: product.paymentStatus,
                    userId: product.userId,
                    sessionId: product.sessionId,
                    firstName: product.firstName,
                    lastName: product.lastName,
                    email: product.email,
                    phoneNo: product.phoneNo,
                    address: product.address,
                    images: JSON.stringify(product.images), // if it's an array
                    eventName: product.eventName,
                    location_address: product.location?.address || '',
                    location_city: product.location?.city || '',
                    noOfPerson: product.noOfPerson,
                    noOfDays: product.noOfDays,
                    Amount: product.Amount,
                    type: product.type,
                    Included: JSON.stringify(product.Included),
                    notIncluded: JSON.stringify(product.notIncluded),
                    bookedMembers: JSON.stringify(product.bookedMembers),
                    bookedEmails: JSON.stringify(product.bookedEmails),
                    amount: product.amount,
                    companyName: product.companyName,
                    categoryName:product.categoryName
                }
            });

        



            return { success: true, message: 'Payment completed Successfully', data: session.id };
        } catch (error) {
            console.error("Error in handleEventCreation:", error);
            throw new Error("Failed to create event in another service layer.");
        }
}
async getCategoryBasedService(postId:string){
  try {
    console.log("menu",postId);
    
    if (postId) {
      console.log("PostId is required",postId);
      
      const result = await this._eventBookingRepo.getCategoryBasedRepo(postId);
      return { success: true, message: 'Reset Password SuccessFully', user: result };
    } else {
      throw new Error('Invalid login credentials.');
    }
  } catch (error) {
    console.error(
      `Error in loginDetails:`,
      error instanceof Error ? error.message : error
    );
    throw new Error('Error verifying login credentials');
  }
}
async saveBillingDetailsService(formData:billingData){
  try {

    const result = await this._eventBookingRepo.saveBillingDetailsRepo(formData);
    console.log("from service", result);
    return {success:result.success,message:result.message,data:result.data};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async saveRetryBillingService(formData:retryBillingData){
    try {

    const result = await this._eventBookingRepo.saveRetryBillingRepo(formData);
    console.log("from service", result);
    return {success:result.success,message:result.message,data:result.data};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async updatePaymentStatusService(bookedId:string){
  try {
    // Fetch data from the repository
    const result = await this._eventBookingRepo.updatePaymentStatusRepo(bookedId);
    console.log("from service", result);
    if(result){
      return {success:result.success,message:result.message};
    }

  } catch (error) {
    // Log and return a generic error response
    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }
}
async checkBookedUserValidService(email:string,eventName:string,bookedId:string){
  try {

    const result = await this._eventBookingRepo.checkUserBookingValidRepo(email,eventName,bookedId);
    console.log("from service", result);

return {result};
  } catch (error) {

    console.error("Error in getAllOfferServiceDetails:", error);
    throw new Error("Failed to create event in another service layer."); 
  }

}

}