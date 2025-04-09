import session from "express-session";

export type FormData={ [key: string]: string|any };
export type FormData1={[key:string]:number};

// In enums.ts



export type EventData = {
  id:string;
  companyName: string;
  eventName: string;
  title: string;
 address:string;
  startDate: string;
  endDate: string;

  destination: string;


  content: string;
  time: string;
  tags: string;
  images: any;  // Adjust the type for images as needed
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
    bookedMembers:string[]

  };



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


  export type makePaymentType=[
    bookedId: string,
    eventName: string,
    images: string[],// Array of image URLs
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