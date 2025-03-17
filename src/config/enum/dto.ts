import session from "express-session";

export type FormData={ [key: string]: string|any };
export type FormData1={[key:string]:number};

// In enums.ts



export type EventData = {
  id:string;
  companyName: string;
  eventName: string;
  title: string;
  location: {
      address: string;
      city: string;
  };
  startDate: string;
  endDate: string;

  destination: string;
  noOfPerson: number;

  content: string;
  time: string;
  tags: string;
  images: any;  // Adjust the type for images as needed
};

export type EventSeatDetails={
  Included: string[];
  notIncluded: string[];
  amount: number;
  noOfSeats:number;
  typesOfTickets:string

}[];


export type verifierFormData={
  name:string,
  email:string,
  password:string,
  companyName:string
}




  

  export type PaymentData = {
    bookedId:string,
    paymentStatus:string,
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
  };



  export type  OfferData={
  
    offerName: string;
    discount_on: string;
    discount_value: string;
    startDate: string; 
    endDate: string;  
    item_description: string;

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
    address:string
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