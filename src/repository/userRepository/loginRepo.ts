import { GoogleAuth } from 'google-auth-library';
import USERDB from '../../models/userModels/userSchema';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import SOCIALEVENT from '../../models/managerModels/socialEventSchema';
import bcrypt  from 'bcrypt';
import { billingData, eventLocation, FormData, PaymentData, retryBillingData, retryPayment } from '../../config/enum/dto';
import { IloginRepo } from './IloginRepo';
import { userDetailsRepository } from './userDetailRepository';
import { userProfileRepository } from './userProfileRepository';
import BOOKEDUSERDB from '../../models/userModels/bookingSchema';
import OFFERDB from '../../models/managerModels/offerSchema';
import Stripe from "stripe";
import { CancelEventRepository } from './cancelEventRepository';
const Stripe_Secret=process.env.STRIPE_SERVER_SECRET
if(!Stripe_Secret){
  throw new Error("Stripe Secret from .env file not found!")
  }
const stripe=new Stripe(Stripe_Secret);

interface User {
  email: string;
  password: string;
}
import { Document } from "mongoose"; // Import for better type safety
import MANAGERSCHEMA from '../../models/managerModels/managerSchema';
import MANAGERWALLETDB from '../../models/managerModels/managerWalletSchema';
import ADMINDB from '../../models/adminModels/adminSchema';
import ADMINWALLETSCHEMA from '../../models/adminModels/adminWalletSchema';
import { NotificationVideoCallRepository } from './notificationVideoCallRepository';


// Define an interface for Events (adjust fields as needed)
interface EventDocument extends Document {
    offer: any;
    endDate: Date;
    title: string;
    startDate:string;

}
const hashPassword = async (password:string) => {
  try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10); // 10 is the salt rounds
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);
      
      console.log('Hashed Password:', hashedPassword);
      return hashedPassword;
  } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
  }
};

export class loginRepo implements IloginRepo{
  private userRepositoy:userDetailsRepository;
  private userProfileRepository:userProfileRepository;
  private cancelEventRepository:CancelEventRepository;
  private notificationRepository:NotificationVideoCallRepository;
  constructor(){
    this.userRepositoy=new userDetailsRepository();
    this.userProfileRepository=new userProfileRepository();
    this.cancelEventRepository=new CancelEventRepository();
    this.notificationRepository=new NotificationVideoCallRepository();
  }
  async isEmailPresent(email: string){
    try {
      const user = await USERDB.findOne({ email });
      return { user: !!user }; 
    } catch (error) {
      console.error('Error checking email in database:', error);
      throw new Error('Database query failed');
    }
  }

  async getEventDataRepo(){
    try {
      const result=await SOCIALEVENT.find();
      return{success:true,message:"Evennt Data Retrieved",data:result}
    } catch (error) {
      console.error("Error saving user data:", error);
      throw new Error('Failed to save user data');
  }
  }
  async postUserData(formData:FormData){
    try{
        console.log("check form Data",formData);
       const hashPassword1= await hashPassword(formData.password);
        
    const newUser  = new USERDB({
        firstName: formData.firstName,
        lastName:formData.lastName,
        email: formData.email,
        password: hashPassword1,
        phoneNo:Number(formData.phoneNo)
      
    });

    // Save the user to the database
    const savedUser  = await newUser .save();


    if(!newUser){
      return { success: false, message: 'Duplicate User Credentials', user: null};
    }

    // You can return the saved user or a success message
    console.log('User  saved successfully:', savedUser );
    return { success: true, message: 'User  created successfully', user: savedUser  };
} catch (error) {
    console.error("Error saving user data:", error);
    throw new Error('Failed to save user data');
}
}

async checkLogin(formData:FormData){
  const { email, password: plainPassword } = formData;

  if (!email || !plainPassword) {
    console.log('Email or password is missing.');
    return {
      success: false,
      message: 'Email or password is required.',
      user: null,
    };
  }

  try {
    // Check if user exists in the database
    const user:User|null = await USERDB.findOne({ email });

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
        categoryNames:null
      };
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    const categoryData = await CATEGORYDB.find();
    const categoryNames = categoryData.map((category) => category.categoryName);
    
    console.log(categoryNames);

    const offers = await OFFERDB.find({ endDate: { $lt: new Date() } });

    for (const offer of offers) {
      const socialEvents = await SOCIALEVENT.find({ offer: offer._id });
    
      for (const event of socialEvents) {
        event.typesOfTickets.forEach((ticket: any) => {
          ticket.offerDetails = {};
        });
    
        event.offer = undefined;
    
        await event.save();
    
        await OFFERDB.updateOne(
          { _id: offer._id },
          { $pull: { Events: event._id } }
        );
      }
    }
    
    
    

    


    if (isMatch) {
      console.log('Password matches!');
      return {
        success: true,
        message: 'Login successful.',
        user,
        categoryNames,
      };
    } else {
      console.log('Password does not match.');
      return {
        success: false,
        message: 'Invalid credentials.',
        user: null,
        categoryNames:null
      };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login.',
      user: null,
      categoryNames:null
    };
  }
}
async googleAuthData(payload: object){

  try {
      const { email, name} = payload as { email: string; name: string;};
      let firstName = '';
      let lastName = '';
      console.log("Checking again",email,name);
      

if (name) {
    const nameParts = name.split(' ');
    firstName = nameParts[0];
    lastName = nameParts[1] || ''; // In case there is no last name
}
console.log("First",firstName,lastName);


      let user = await USERDB.findOne({ email });

      if (user) {
          console.log('Existing user:', user);
          return { success: true, message: 'User logged in', user };
      }
      user = new USERDB({ firstName,lastName, email});
      await user.save();

      console.log('New user created:', user);
      return { success: true, message: 'Login Successful', user };
  } catch (error: unknown) {
      if (error instanceof Error) {
          console.error('Error during Google authentication:', error.message);
          return { success: false, message: 'Authentication failed: ' + error.message, user: null };
      } else {
          console.error('Unexpected error during Google authentication:', error);
          return { success: false, message: 'Authentication failed due to an unexpected error.', user: null };
      }
  }
}
async isEmailValid(email:string){
  try {
    const user:User|null = await USERDB.findOne({ email });

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }
    return {
      success: true,
      message: 'Login successful.',
      user,
    };
    
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login.',
      user: null,
    };
  }
}

async fetchuserEmail(userId:string){
  try {
    const user = await USERDB.findById(userId);

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }
    return {
      success: true,
      message: 'Login successful.',
      user:user.email,
    };
    
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login.',
      user: null,
    };
  }
}



async resetPasswordRepo(email: string, formData:FormData){
  const  password = formData.password;
  const confirmPassword=formData.password1;

  // Validate input
  console.log("Last checking",password,confirmPassword);
  
  if (!email || !password || !confirmPassword) {
    console.log('Email, password, or confirm password is missing.');
    return {
      success: false,
      message: 'Email, password, and confirm password are required.',
      user: null,
    };
  }

  if (password !== confirmPassword) {
    console.log('Passwords do not match.');
    return {
      success: false,
      message: 'Passwords do not match.',
      user: null,
    };
  }

  try {
    // Check if the user exists (ensuring the user is a Document)
    const user = await USERDB.findById(email);

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;

    await user.save();

    console.log('Password reset successful.');
    return {
      success: true,
      message: 'Password reset successful.',
      user: { id: user._id, email: user.email },
    };
  } catch (error) {
    console.error('Error during password reset:', error);
    return {
      success: false,
      message: 'An error occurred during password reset.',
      user: null,
    };
  }
}


async resetUserProfile(email: string, formData:FormData,location:eventLocation|null){
  try {
    const user = await USERDB.findOne({ email });
    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }
    if(!location?.coordinates){
      return {
        success: false,
        message: 'latitude,longitude not found.',
        user: null,
      };
    }
    user.firstName=formData.firstName;
    user.lastName=formData.lastName;
    user.phoneNo=formData.phoneNo;
    user.address=formData.address.split(' ').slice(0, 4).join(' ');
    user.location={type:'Point',coordinates:location?.coordinates}
    await user.save();

    return {
      success: true,
      message: 'User Details reset successful.',
      user:user,
    };
  } catch (error) {
    console.error('Error during password reset:', error);
    return {
      success: false,
      message: 'An error occurred during password reset.',
      user: null,
    };
  }
}
async getAllCategoryRepository(){
  const categoryData=await CATEGORYDB.find({isListed:true});
  try {
    console.log('Category details retrieved successfully123:', categoryData);
    return {
      success: true,
      message: 'Category details retrieved successfully.',
      category:categoryData,
    };
  } catch (error) {
    console.error('Error retrieving User details:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving User details.',
      category: null,
    };
  }
}



async getUserDetailsRepository(userId:string){
  console.log("name of User",userId);
  const userData=await USERDB.findById(userId);
  try {


    if (!userData) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        category: null,
      };
    }

    console.log('User details retrieved successfully:', userData);
    return {
      success: true,
      message: 'User details retrieved successfully.',
      user:userData, // Return the populated category details
    };
  } catch (error) {
    console.error('Error retrieving User details:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving User details.',
      category: null,
    };
  }
}

  async getCategoryBasedRepo(postId: string) {
    try {
      console.log("Id of category:", postId);

      // Fetch category and populate Events as full objects
      const category = await CATEGORYDB.findById(postId).populate<{ Events: EventDocument[] }>("Events");

      if (!category) {
        return {
          success: false,
          message: "Category not found.",
          category: null,
        };
      }

      console.log("Category details:", category);

      // Filter events that have a valid endDate
      const now = Date.now();
      let filteredEvents = category.Events.filter(event => new Date(event.startDate).getTime() >= now);
      

      console.log("First", filteredEvents);
      filteredEvents = filteredEvents.map(event => {
        if (event.offer && new Date(event.offer.endDate) < new Date()) {
            console.log(`Offer expired for event: ${event.endDate}`);
            event.offer = null; 
        }
        return event;
    });

      console.log("Main Events", filteredEvents);

      return {
        success: true,
        message: "Category details retrieved successfully.",
        category: {
          ...category.toObject(),
          Events: filteredEvents, 
        },
      };
    } catch (error) {
      console.error("Error retrieving category details:", error);
      return {
        success: false,
        message: "An error occurred while retrieving category details.",
        category: null,
      };
    }
  }



async getAllEventBasedRepo(): Promise<any> { // Use 'any' or a more specific type if needed
  try {
    const eventData = await SOCIALEVENT.find();

    const updatedEvents: any[] = [];

    for (const event of eventData) {
      if (new Date(event.startDate) >= new Date()) {
        const category = await CATEGORYDB.findOne({ categoryName: event.title });
        console.log("Category",category);


        console.log("Events:",event);
        
        
        if (category && category.isListed) {  // assuming 'isBlocked' is the field name
          updatedEvents.push(event);
        }
      }
    }

    return {
      success: true,
      message: "Event Details retrieved successfully.",
      events: updatedEvents,
    } as const; 
  } catch (error) {
    console.error("Error retrieving category details:", error);
    return {
      success: false,
      message: "An error occurred while retrieving category details.",
      categories: [],
    } as const; 
  }
}





async getCategoryTypeRepo(categoryName1:string){
  console.log("name of category",categoryName1)
  try {
    // Find the category by name and populate the Events field
    const category = await CATEGORYDB.findOne({_id: categoryName1 }).populate('Events');

    console.log("Blank",category)

    if (!category) {
      console.log('Category not found.');
      return {
        success: false,
        message: 'Category not found.',
        category: null,
      };
    }

    console.log('Category details retrieved successfully:', category);
    return {
      success: true,
      message: 'Category details retrieved successfully.',
      category:category.Events, // Return the populated category details
    };
  } catch (error) {
    console.error('Error retrieving category details:', error);
    return {
      success: false,
      message: 'An error occurred while retrieving category details.',
      category: null,
    };
  }
}

   async posthandleLikeForPost(index:string,userId:string,postId:string) {
        try {
            console.log("Delegating event data to the actual repository...");
            // Pass the data to the actual repository for database operations
            const savedEvent = await this.userRepositoy.postHandleLike(index,userId,postId);
            
            return {savedEvent};
        } catch (error) {
            console.error("Error in postEventRepository:", error);
            throw new Error("Failed to handle event data in main repository.");
        }
    }

    async getPostDetailsRepo(postId:string) {
      try {
          console.log("Delegating event data to the actual repository...");

          const savedEvent = await this.userRepositoy.getPostDetailsRepository(postId);
          
          return {savedEvent};
      } catch (error) {
          console.error("Error in postEventRepository:", error);
          throw new Error("Failed to handle event data in main repository.");
      }
  }
  async getSelectedEventRepo(postId:string) {
    try {
        console.log("Delegating event data to the actual repository...");
        const savedEvent = await this.userRepositoy.getSelectedEventRepository(postId);
        
        return {savedEvent};
    } catch (error) {
        console.error("Error in postEventRepository:", error);
        throw new Error("Failed to handle event data in main repository.");
    }
}
async getCancelBookingRepo(bookingId:string){
  try {
    console.log("Delegating event data to the actual repository...");
    const savedEvent = await this.userRepositoy.getCancelBookingRepository(bookingId);
    
    return {savedEvent};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}
async checkUserBookingValidRepo(email:string,eventName:string){
    try {

    const savedEvent = await this.userRepositoy.checkUserBookingValidRepository(email,eventName);
    
    return {savedEvent};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}
async checkSeatAvailable(product: PaymentData) {
  try {
    const socialEvent = await SOCIALEVENT.findOne({ eventName: product.eventName });
    if (!socialEvent) {
      return { success: false, message: "Event not found", data: null };
    }
    if(socialEvent?.title!='Virtual'){
  
  
      const selectedEvent = socialEvent.typesOfTickets.find(
        (ticket: any) => ticket.type.toLowerCase() === product.type
      );
  
      if (!selectedEvent) {
        return { success: false, message: "Ticket type not found", data: null };
      }
  
      if (!selectedEvent.noOfSeats || selectedEvent.noOfSeats <= 0 || selectedEvent.noOfSeats<product.noOfPerson) {
        return { success: false, message: "No seats available", data: null };
      }

    }
    return { success: true, message: "Seats available", data: { seatsRemaining:null} };

  } catch (error) {
    console.error("Error in checkSeatAvailable:", error);
    throw new Error("Failed to check seat availability.");
  }
}

async checkRetrySeatAvailable(product: retryPayment) {
  try {
    const socialEvent = await SOCIALEVENT.findOne({ eventName: product.eventName });
    if (!socialEvent) {
      return { success: false, message: "Event not found", data: null };
    }
    if(socialEvent?.title!='Virtual'){
  
  
      const selectedEvent = socialEvent.typesOfTickets.find(
        (ticket: any) => ticket.type.toLowerCase() === product.type
      );
  
      if (!selectedEvent) {
        return { success: false, message: "Ticket type not found", data: null };
      }
  
      if (!selectedEvent.noOfSeats || selectedEvent.noOfSeats <= 0 || selectedEvent.noOfSeats<product.noOfPerson) {
        return { success: false, message: "No seats available", data: null };
      }

    }
    return { success: true, message: "Seats available", data: { seatsRemaining:null} };

  } catch (error) {
    console.error("Error in checkSeatAvailable:", error);
    throw new Error("Failed to check seat availability.");
  }
}



async savePaymentData(paymentData: PaymentData) {
  try {
    console.log("Normal");
    
    console.log("Checking the bookedId", paymentData);
    if (!paymentData.bookedId || !paymentData.companyName) {
      throw new Error("Missing required payment data.");
    }
    const existingBooking = await BOOKEDUSERDB.findById(paymentData.bookingId);
    console.log("Existing booking found:", existingBooking);

    if (!existingBooking) {
      return { success: false, message: "Booking not found", data: null };
    }

    // Validate payment status
    // const validPaymentStatus = (status: string): "Pending" | "Cancelled" | "Completed" => {
    //   if (status === "Success") return "Pending";
    //   if (status === "Cancelled") return "Cancelled";
    //   if (status === "Completed") return "Completed";
    //   throw new Error("Invalid payment status received: " + status);
    // };
    console.log("NoOfPerson",paymentData.noOfPerson,paymentData.paymentStatus);
    
    existingBooking.paymentStatus = 'Completed';
    existingBooking.bookingDate = new Date();
    existingBooking.totalAmount = paymentData.Amount||paymentData.amount;
    existingBooking.NoOfPerson = paymentData.noOfPerson;
    if (!existingBooking.ticketDetails) {
      existingBooking.ticketDetails = { Included: [], notIncluded: [], type: undefined };
    }
    
    existingBooking.ticketDetails.type = paymentData.type || undefined;
    existingBooking.ticketDetails.Included = paymentData.Included || [];
    existingBooking.ticketDetails.notIncluded = paymentData.notIncluded || [];



console.log("Payment",paymentData.bookedEmails,paymentData.bookedMembers);
console.log("Length:",paymentData.bookedEmails.length,paymentData.bookedMembers.length);
    if (
      Array.isArray(paymentData.bookedMembers) &&
      Array.isArray(paymentData.bookedEmails) &&
      paymentData.bookedMembers.length === paymentData.bookedEmails.length
    ) {
      console.log("Black");
      for (let i = 0; i < paymentData.bookedMembers.length; i++) {
        console.log(paymentData.bookedMembers[i],paymentData.bookedEmails[i]);
        existingBooking.bookedUser.push({
         
          user: paymentData.bookedMembers[i],
          email: paymentData.bookedEmails[i],
          isParticipated: false,
        });
      }
    }
    


    

    const uniqueIncluded = new Set(paymentData.Included || []);
    const uniqueNotIncluded = new Set(paymentData.notIncluded || []);
    
    existingBooking.ticketDetails.Included = Array.from(uniqueIncluded);
    existingBooking.ticketDetails.notIncluded = Array.from(uniqueNotIncluded);
    
    const updatedBooking = await existingBooking.save();

    const managerDetails = await MANAGERSCHEMA.findOne({ firmName: paymentData.companyName });
    console.log("Manager details found:", managerDetails);

    if (!managerDetails) {
      return { success: false, message: "Manager not found", data: null };
    }

    let adminAmount=0;
    let managerAmount=0;
    if (existingBooking.paymentStatus === "Completed") {
      const totalAmount = paymentData.Amount||paymentData.amount;
      managerAmount = Math.floor(totalAmount * 0.9);
      adminAmount = Math.floor(totalAmount * 0.1);
      console.log("Processing Stripe Transfer...");

      let managerWallet = await MANAGERWALLETDB.findOne({ managerId: managerDetails._id });
      if (!managerWallet) {
        managerWallet = new MANAGERWALLETDB({ managerId: managerDetails._id, balance: 0, currency: 'USD', transactions: [] });
      }
      
      managerWallet.balance += Math.round(managerAmount);
      managerWallet.transactions.push({
        userId: existingBooking.userId,
        managerAmount,
        type: "credit",
        status: "completed",
        eventName:paymentData.eventName,
        bookedId:paymentData.bookedId,
        noOfPerson:paymentData.noOfPerson
      });
      await managerWallet.save();
    }
    let adminDetails = await ADMINDB.findOne(); // Fetch the single admin
    if (!adminDetails) {
        throw new Error("Admin not found");
    }
    
    let adminWallet = await ADMINWALLETSCHEMA.findOne({ adminId: adminDetails._id });
    if(!adminWallet){
     adminWallet = await ADMINWALLETSCHEMA.create({
        adminId: adminDetails._id,
        balance: adminAmount, // Assign balance directly
        currency: 'USD',
        transactions: [
          {
            totalAmount: paymentData.Amount,
            userId: paymentData.userId,
            managerAmount: managerAmount,
            adminAmount:adminAmount,
            type: 'credit',
            status: 'completed',
            createdAt: new Date(),
            eventName:paymentData.eventName,
            bookedId:paymentData.bookedId,
            noOfperson:paymentData.noOfPerson,
            companyName:paymentData.companyName
      
          }
        ]
      });
      
    }else{
      adminWallet.balance += adminAmount;
  adminWallet.transactions.push({
    totalAmount: paymentData.Amount,
    userId: paymentData.userId,
    managerAmount: managerAmount,
    adminAmount:adminAmount,
    type: 'credit',
    status: 'completed',
    createdAt: new Date(),
    eventName:paymentData.eventName,
    bookedId:paymentData.bookedId
  });
  await adminWallet.save();
    }
    
    console.log(adminWallet);

    const socialEvent = await SOCIALEVENT.findOne({ eventName: paymentData.eventName });

    if (socialEvent) {
      console.log("No of Person:",paymentData.noOfPerson);
      socialEvent.typesOfTickets.forEach((ticket: any) => {
        if (ticket.type.toLowerCase() === paymentData.type) {
          console.log("Hellom");
          
          ticket.noOfSeats -= paymentData.noOfPerson;
        }
      });
     
    
      await socialEvent.save();
    }
    return {
      success: true,
      message: "Payment data saved successfully",
      data: updatedBooking,
    };

  } catch (error) {
    console.error("Error saving payment data:", error || error);
    return { success: false, message: "Database error while saving payment data.", data: null };
  }
}



async saveRetryPaymentData(paymentData: retryPayment) {
  try {
    console.log("Checking the bookedId", paymentData);


    if (!paymentData.bookedId || !paymentData.paymentStatus  || !paymentData.companyName) {
      throw new Error("Missing required payment data.");
    }
    const existingBooking = await BOOKEDUSERDB.findById(paymentData.bookingId);
    console.log("Existing booking found:", existingBooking);

    if (!existingBooking) {
      return { success: false, message: "Booking not found", data: null };
    }

    // Validate payment status
    // const validPaymentStatus = (status: string): | "Cancelled" | "Completed" => {
    //   if (status === "Success") return "Completed";
    //   if (status === "Cancelled") return "Cancelled";
    //   throw new Error("Invalid payment status received: " + status);
    // };
    console.log("NoOfPerson",paymentData.noOfPerson);
    
    existingBooking.paymentStatus = "Completed";
    existingBooking.bookingDate = new Date();
    existingBooking.totalAmount = paymentData.amount;
    existingBooking.NoOfPerson = paymentData.noOfPerson;
    if (!existingBooking.ticketDetails) {
      existingBooking.ticketDetails = { Included: [], notIncluded: [], type: undefined };
    }
    
    existingBooking.ticketDetails.type = paymentData.type || undefined;




console.log("Payment",paymentData.bookedEmails,paymentData.bookedMembers);
console.log("Length:",paymentData.bookedEmails.length,paymentData.bookedMembers.length);
  
if (
  Array.isArray(paymentData.bookedMembers) &&
  Array.isArray(paymentData.bookedEmails)
) {

  existingBooking.bookedUser.splice(0, existingBooking.bookedUser.length);


  for (let i = 0; i < paymentData.bookedMembers.length; i++) {
    existingBooking.bookedUser.push({
      user: paymentData.bookedMembers[i],
      email: paymentData.bookedEmails[i],
      isParticipated: false,
    });
  }
}


    


    
    const updatedBooking = await existingBooking.save();

    const managerDetails = await MANAGERSCHEMA.findOne({ firmName: paymentData.companyName });
    console.log("Manager details found:", managerDetails);

    if (!managerDetails) {
      return { success: false, message: "Manager not found", data: null };
    }

    let adminAmount=0;
    let managerAmount=0;
    if (existingBooking.paymentStatus ==='Completed') {
      const totalAmount = paymentData.amount;
      managerAmount = Math.floor(totalAmount * 0.9);
      adminAmount = Math.floor(totalAmount * 0.1);
      console.log("Processing Stripe Transfer...");

      let managerWallet = await MANAGERWALLETDB.findOne({ managerId: managerDetails._id });
      if (!managerWallet) {
        managerWallet = new MANAGERWALLETDB({ managerId: managerDetails._id, balance: 0, currency: 'USD', transactions: [] });
      }
      
      managerWallet.balance += Math.round(managerAmount);
      managerWallet.transactions.push({
        userId: existingBooking.userId,
        managerAmount,
        type: "credit",
        status: "completed",
        eventName:paymentData.eventName,
        bookedId:paymentData.bookedId,
        noOfPerson:paymentData.noOfPerson
      });
      await managerWallet.save();
    }
    let adminDetails = await ADMINDB.findOne(); // Fetch the single admin
    if (!adminDetails) {
        throw new Error("Admin not found");
    }
    
    let adminWallet = await ADMINWALLETSCHEMA.findOne({ adminId: adminDetails._id });
    if(!adminWallet){
     adminWallet = await ADMINWALLETSCHEMA.create({
        adminId: adminDetails._id,
        balance: adminAmount, // Assign balance directly
        currency: 'USD',
        transactions: [
          {
            totalAmount: paymentData.amount,
            userId: paymentData.userId,
            managerAmount: managerAmount,
            adminAmount:adminAmount,
            type: 'credit',
            status: 'completed',
            createdAt: new Date(),
            eventName:paymentData.eventName,
            bookedId:paymentData.bookedId,
            noOfperson:paymentData.noOfPerson,
            companyName:paymentData.companyName
      
          }
        ]
      });
      
    }else{
      adminWallet.balance += adminAmount;
  adminWallet.transactions.push({
    totalAmount: paymentData.amount,
    userId: paymentData.userId,
    managerAmount: managerAmount,
    adminAmount:adminAmount,
    type: 'credit',
    status: 'completed',
    createdAt: new Date(),
    eventName:paymentData.eventName,
    bookedId:paymentData.bookedId
  });
  await adminWallet.save();
    }
    
  

    const socialEvent = await SOCIALEVENT.findOne({ eventName: paymentData.eventName });

    if (socialEvent) {
      console.log("No of Person:",paymentData.noOfPerson);
      socialEvent.typesOfTickets.forEach((ticket: any) => {
        if (ticket.type.toLowerCase() === paymentData.type) {
          console.log("Hellom");
          
          ticket.noOfSeats -= paymentData.noOfPerson;
        }
      });
     
    
      await socialEvent.save();
    }
    return {
      success: true,
      message: "Payment data saved successfully",
      data: updatedBooking,
    };

  } catch (error) {
    console.error("Error saving payment data:", error || error);
    return { success: false, message: "Database error while saving payment data.", data: null };
  }
}


async handleCancelPayment(bookingId: string): Promise<void> {
  console.log("What is this",bookingId);
  
  if (!bookingId) {
    console.warn(" No bookingId provided to cancel payment.");
    return;
  }

  try {
    const result = await BOOKEDUSERDB.deleteOne({ _id: bookingId });

    if (result.deletedCount === 0) {
      console.warn(` No booking found with ID: ${bookingId}`);
    } else {
      console.log(` Booking with ID ${bookingId} successfully cancelled.`);
    }
  } catch (error) {
    console.error(`Error cancelling booking with ID ${bookingId}:`, error);
  }
}






async handleReviewRatingRepo(formData:FormData) {
  try {
      console.log("posting review and rating to the actual repository...");

      const savedEvent = await this.userProfileRepository.postReviewRatingRepository(formData);
      return {savedEvent};
  } catch (error) {
      console.error("Error in postEventRepository:", error);
      throw new Error("Failed to handle event data in main repository.");
  }
}


async saveBillingDetailsRepo(formData:billingData){
  try {
    console.log("Delegating event data to the actual repository...");
    const savedEvent = await this.userRepositoy.saveUserBilingDetailsRepository(formData);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}

async saveRetryBillingRepo(formData:retryBillingData){
    try {
    const savedEvent = await this.userRepositoy.saveRetryBilingRepository(formData);
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


async updatePaymentStatusRepo(bookedId:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userRepositoy.updateBookedPaymentStatusRepository(bookedId);
  if(savedEvent){
    return {success:savedEvent.success,message:savedEvent.message};
  }

} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}

async getEventHistoryRepo(userId:string){
  try {

console.log("UserId:",userId);

    const savedEvent = await this.userProfileRepository.getEventHistoryRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}




async getExistingReviewRepo(userId:string,eventId:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.getExistingReviewRepository(userId,eventId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}
async getEventBookedRepo(userId:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.getEventBookedRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


async checkOfferAvailableRepo(categoryName: string) {
  try {
    const savedEvent = await OFFERDB.findOne({ discount_on: categoryName });

    if (!savedEvent) {
      return {
        success: false,
        message: "No Offers Available",
        data: [],
      };
    }

    // Check if the offer is still valid (endDate is in the future)
    const currentDate = new Date();
    if (new Date(savedEvent.endDate) < currentDate) {
      return {
        success: false,
        message: "Offer has expired",
        data: [],
      };
    }

    return { success: true, message: "Offers Found", data: savedEvent };
  } catch (error) {
    console.error("Error in checkOfferAvailableRepo:", error);
    throw new Error("Failed to handle event data in main repository.");
  }
}

async cancelBookedEventRepo(bookingId:string,userId:string):Promise<{success:boolean,message:string,data:any}>{
  try {

    const savedEvent = await this.cancelEventRepository.cancelBookedEventRepository(bookingId,userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}

}
async fetchUserWalletRepo(userId:string){
  try {


    const savedEvent = await this.cancelEventRepository.fetchUserWalletRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in User Wallet Repository:", error);
    throw new Error("Failed to handle user wallet in main repository.");
}

}
async fetchUserNotificationRepo(userId:string){
  try {


    const savedEvent = await this.notificationRepository.fetchUserNotificationRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in User Notification Repository:", error);
    throw new Error("Failed to handle user Notificstion in main repository.");
}
}
async fetchUserNotificationCountRepo(userId:string){
  try {


    const savedEvent = await this.notificationRepository.fetchUserNotificationCountRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in User Notification Repository:", error);
    throw new Error("Failed to handle user Notificstion in main repository.");
}

}






async getManagerDataRepo(userId:string){
  try {


    const savedEvent = await this.userProfileRepository.getBookedManagerRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


async createChatSchemaRepo(userId:string,manager:string){
  try {
    const savedEvent = await this.userProfileRepository.createChatSchemaRepository(userId,manager);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}

async uploadUserProfilePictureRepo(userId:string,profilePicture:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.uploadUserProfilePictureRepository(userId,profilePicture);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


















  

    
    

    
}
