import Stripe from 'stripe';
import { Request,Response } from 'express';
import HTTP_statusCode from '../../contants/enums';
import { injectable,inject } from 'inversify';
import TYPES from '../../inversify/types';
import { IStripeService } from '../../interfaces/userInterfaces/serviceInterfaces/IStripeService';

@injectable()
export class StripePaymentController{
    constructor(
        @inject(TYPES.IStripeService) private _stripePaymentService:IStripeService
    ){}
    
  async handleWebhook(req: Request, res: Response) {
    try {
      console.log("Handle webhook");

      const stripe = new Stripe(process.env.STRIPE_SERVER_SECRET as string, {
        apiVersion: '2025-05-28.basil',
      });

      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        throw new Error("Missing Stripe signature");
      }

      const rawBody = req.body as Buffer;

      // ✅ Call your own logic here
      await this._stripePaymentService.confirmPayment(rawBody, signature);

      res.status(HTTP_statusCode.OK).json({ received: true });

    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(HTTP_statusCode.InternalServerError).send(`Webhook Error: ${error.message}`);
    }
  }
}
