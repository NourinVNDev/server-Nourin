export interface IStripeService{
        confirmPayment(rawBody:Buffer,signature:string):Promise<{success:boolean,message:string,data:any}|undefined>
    
}