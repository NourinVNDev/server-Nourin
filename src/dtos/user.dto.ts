import session from "express-session";
import mongoose, { Schema, Document, Types } from "mongoose";

interface IManagerTransaction {
  userId: Types.ObjectId;
  managerAmount: number;
  type: "credit" | "debit" | "transfer";
  status?: "pending" | "completed" | "failed";
  createdAt?: Date;
  eventName?: string;
  bookedId?: string;
  noOfPerson?: number;
}

export interface IManagerWallet extends Document {
  managerId: Types.ObjectId;
  balance: number;
  currency: string;
  transactions: IManagerTransaction[];
}

export type FormData={ [key: string]: string|any };
export type FormData1={[key:string]:number};

export type EventData = {
  _id:string;
  companyName: string;
  eventName: string;
  title: string;
 address?:string;
  startDate: string;
  endDate: string;

  destination?: string;

amount?:string;
  content: string;
  time: string;
  tags: string;
  images: any; 
};
export interface User {
  email: string;
  password: string;
}
export interface UserPayload {
  email: string;
  role:string
}

export type eventLocation={

    type:'Point',
coordinates:[number,number]

  


}
export type EventSeatDetails={
  Included: string[];
  notIncluded: string[];
  amount: number;
  noOfSeats:number;
  typesOfTickets:string

}[];
interface BookedUser {
  email: string;
  user: string;
}
export interface BookingData {
  data: {
    bookedUser: BookedUser[];
    totalAmount: number;
    NoOfPerson: number;
    bookingId: string;
    bookingDate: string;
  };
}
export interface EventDocument extends Document {
    offer: any;
    endDate: Date;
    title: string;
    startDate:string;

}

export interface EventDetails {
  eventName: string;
  startDate: string;
  endDate: string;
  time: string;
}

export interface ManagerWallet {
  balance: number;
  transactions: {
    userId: mongoose.Types.ObjectId;
    managerAmount: number;
    type: string;
    status: string;
    createdAt: Date;
    eventName: string;
    bookedId: string;
    companyName: string;
    noOfPerson: number;
  }[];
}


export type verifierFormData={
  verifierName:string,
  email:string,
  Events:string[],
  companyName:string
  _id?:string
}




  

  export type PaymentData = {
    bookedId:string,
    bookingId:string,
    userId:string,
    sessionId:string,
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: number;
    address: string;
    companyName: string;
    images: string[];
    eventName: string;
    location: {
      address: string;
      city: string;
    };
    noOfPerson: number;
    noOfDays: number;
    Amount: number;
    type:string;
    managerId:string;
    Included:[string];
    notIncluded:[string];
    bookedMembers:string[];
    bookedEmails:string[];
    amount:number;
    paymentStatus:string;
    categoryName:string
  };

  export type retryPayment={
     bookedId:string,
    bookingId:string,
    userId:string,
    sessionId:string,
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: number;
    address: string;
    companyName: string;
    images: string[];
    eventName: string;
    location: {
      address: string;
      city: string;
    };
    noOfPerson: number;
    noOfDays: number;
    Amount: number;
    type:string;
    managerId:string;
    Included:[string];
    notIncluded:[string];
    bookedMembers:string[];
    bookedEmails:string[];
    amount:number;
    paymentStatus:string;
    categoryName:string

  }
    






  export type  OfferData={
  
    offerName: string;
    discount_on: string;
    discount_value: string;
    startDate: string; 
    endDate: string;  
    item_description: string;
    managerId:string;

  }


  export type billingData={
    bookedId:string
    eventId:string,
    userId:string,
    categoryName:string,
    firstName:string,
    lastName:string,
    email:string,
    phoneNo:number,
    address:string,
    ticketType:string
  }
  export type retryBillingData={
    bookingId:string
    userId:string,
    firstName:string,
    lastName:string,
    email:string,
    phoneNo:number,
    address:string,
  }


  export type makePaymentType=[
    bookedId: string,
    eventName: string,
    images: string[],
    Amount: number,
    noOfPerson: number,
    sessionId:string,
    paymentStatus:'Success'|'canceled'
  ]

  export type TicketType ={
    type: string;
    noOfSeats: number;
    Amount: number;
    Included: string[];
    notIncluded: string[];
    _id: string
    id:string
}