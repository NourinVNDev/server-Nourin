import { inject, injectable } from "inversify";
import { BookingData } from "../../dtos/user.dto";
import { IStripeService } from "../../interfaces/userInterfaces/serviceInterfaces/IStripeService";
import Stripe from "stripe";
import TYPES from "../../inversify/types";
import { IStripeRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IStripeRepo";
import SendBookingConfirmation from "../../utils/bookingConfirmation.util";
@injectable()
export class StripePaymentService implements IStripeService{
    constructor(
        @inject(TYPES.IStripeRepo) private _stripePaymentRepo:IStripeRepo

    ){}
    async confirmPayment(rawBody:Buffer,signature:string){


  console.log("Signnature",signature,rawBody);
  
    try {
      const stripeSecret = process.env.STRIPE_SERVER_SECRET;
      const webhookSecret =process.env.STRIPE_WEBHOOK_SECRET

      if (!stripeSecret) {
        console.error("STRIPE_SERVER_SECRET is missing.");
        throw new Error("STRIPE_SERVER_SECRET is not set in environment.");
      }

      if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is missing.");
        throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment.");
      }


      const stripe = new Stripe(stripeSecret, {
        apiVersion: '2025-05-28.basil',
      });

      console.log("Signature:", signature);
      console.log("Raw Body Preview:", rawBody.toString('utf-8').slice(0, 200));

      
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      let paymentData: any;
      console.log("Stripe Event Constructed:", event.type);

      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const managerId=session.metadata?.managerId||"";
        const bookedId=session.metadata?.bookedId||"";
        const bookingId=session.metadata?.bookingId||"";
        const paymentStatus=session.metadata?.paymentStatus||"";
        const userId=session.metadata?.userId||"";
        const sessionId=session.metadata?.sessionId||"";
        const firstName=session.metadata?.firstName||"";
        const lastName=session.metadata?.lastName||"";
        const email=session.metadata?.email||"";
        const phoneNo=session.metadata?.phoneNo||0;
        const address=session.metadata?.address||"";
        const images= JSON.parse(session.metadata?.images || "[]");
        const eventName=session.metadata?.eventName||"";
        const location_address=session.metadata?.location_address||"";
        const location_city=session.metadata?.location_city||"";
        const noOfPerson=session.metadata?.noOfPerson||0;
        const noOfDays=session.metadata?.noOfDays||0;
        const Amount=session.metadata?.Amount||0;
        const type=session.metadata?.type||"";
        const Included=JSON.parse(session.metadata?.Included||"[]");
        const notIncluded=JSON.parse(session.metadata?.notIncluded||"[]");
        const bookedMembers=JSON.parse(session.metadata?.bookedMembers||"[]");
        const bookedEmails=JSON.parse(session.metadata?.bookedEmails||"[]");
        const amount=session.metadata?.amount||0;
        const companyName=session.metadata?.companyName||"";
        const categoryName=session.metadata?.categoryName||""


        paymentData={
          managerId,
          bookedId,
          bookingId,
          userId,
          sessionId,
          firstName,
          lastName,
          email,
         phoneNo:Number(phoneNo),
          address,
          images,
          eventName,
          location:{
            address:location_address,
            city:location_city
          },
          noOfPerson:Number(noOfPerson),
          noOfDays:Number(noOfDays),
          Amount:Number(Amount),
          type,
          Included,
          notIncluded,
          bookedMembers,
          bookedEmails,
          amount:Number(amount),
          companyName,
          paymentStatus:paymentStatus,
          categoryName
        }
        let bookingData: BookingData;
          bookingData=await this._stripePaymentRepo.saveRetryPaymentData(paymentData);
              console.log("Data");
    const bookedUsers =bookingData.data.bookedUser;
    const singleAmount=bookingData.data.totalAmount/bookingData.data.NoOfPerson;

    console.log("BookedUser Data:",bookedUsers);
    console.log("Amount:",singleAmount);

    if (Array.isArray(bookedUsers)) {


for (const user of bookedUsers) {
  try {
    await SendBookingConfirmation(
      user.email,
      user.user,
      bookingData.data.bookingId,
      paymentData.eventName,
      bookingData.data.bookingDate,
      1,
      singleAmount,
      paymentData.categoryName

    );
  } catch (error) {
    console.error(`Failed to send confirmation to ${user.email}`, error);
  }
}
    } 
      return {success:true,message:'Saved Booked User Information',data:null}
      } else {
        console.log("Hai");
        
        if (paymentData.bookingId) {

          console.log("Dash",paymentData.bookingId);
          
    await this._stripePaymentRepo.handleCancelPayment(paymentData.bookingId);
  }
      }
    

    } catch (err: any) {
      if (err.type === 'StripeSignatureVerificationError') {
        console.error("🚫 Invalid Stripe Webhook Secret or Signature.");
        console.error("🔎 Possible reasons:");
        console.error(" - Incorrect STRIPE_WEBHOOK_SECRET");
        console.error(" - Wrong endpoint secret used");
        console.error(" - Raw body was parsed before reaching Stripe webhook");
        console.error("📄 Error Message:", err.message);
      } else if (err.code === 'ERR_STRIPE_SECRET_INVALID') {
        console.error("❌ Stripe Server Secret is incorrect.");
      }
    }


}

}