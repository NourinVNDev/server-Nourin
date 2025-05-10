import session from "express-session";

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
    paymentStatus:string,
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
    amount:number

  };

  export type retryPayment={
    firstName:string;
    lastName:string;
    email:string;
    phoneNo:string;
    address:string;
    images:string[];
    eventName:string;
    location:string;
    companyName:string;
    amount:number;
    noOfDays:string;
    bookedMembers:string[];
    bookedEmails:string[];
    noOfPerson:0
    bookedId:string,
    title:string,
    paymentStatus:string
    userId:string,
    managerId:string,
    type:string,
    _id:string
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
    ticketType:string,
  }
  export type retryBillingData={
    _id:string
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