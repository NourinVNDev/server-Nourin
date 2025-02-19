import { GoogleAuth } from 'google-auth-library';
import USERDB from '../../models/userModels/userSchema';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import SOCIALEVENT from '../../models/managerModels/socialEventSchema';
import bcrypt  from 'bcrypt';
import { hash } from 'crypto';
import { billingData, FormData, PaymentData } from '../../config/enum/dto';
import { IloginRepo } from './IloginRepo';
import { userDetailsRepository } from './userDetailRepository';
import { userProfileRepository } from './userProfileRepository';
import BOOKEDUSERDB from '../../models/userModels/bookingSchema';
import OFFERDB from '../../models/managerModels/offerSchema';
interface User {
  email: string;
  password: string;
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
  constructor(){
    this.userRepositoy=new userDetailsRepository();
    this.userProfileRepository=new userProfileRepository();
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
        console.log("sneha",formData);
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


      // Check if the user exists in the database
      let user = await USERDB.findOne({ email });

      if (user) {
          console.log('Existing user:', user);
          return { success: true, message: 'User logged in', user };
      }

      // If user does not exist, create a new one
      user = new USERDB({ firstName,lastName, email});
      await user.save();

      console.log('New user created:', user);
      return { success: true, message: 'Login Successful', user };
  } catch (error: unknown) {
      // Narrow the error type and handle accordingly
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
    // Check if user exists in the database
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
    // Check if user exists in the database
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



async resetPasswordRepo(userId: string, formData:FormData){
  const  password = formData.password;
  const confirmPassword=formData.password1;

  // Validate input
  console.log("Last checking",password,confirmPassword);
  
  if (!userId || !password || !confirmPassword) {
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
    const user = await USERDB.findById(userId);

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }

    // Hash the password (asynchronous)
    const hashedPassword = await hashPassword(password);

    // Update the user's password
    user.password = hashedPassword;

    // Ensure you're calling `save()` on a Mongoose document instance
    await user.save();

    console.log('Password reset successful.');
    return {
      success: true,
      message: 'Password reset successful.',
      user: { id: user._id, email: user.email }, // Return limited user info
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


async resetUserProfile(email: string, formData:FormData){


  try {
    // Check if the user exists (ensuring the user is a Document)
    const user = await USERDB.findOne({ email });

    if (!user) {
      console.log('User not found.');
      return {
        success: false,
        message: 'User not found.',
        user: null,
      };
    }



    user.firstName=formData.firstName;
    user.lastName=formData.lastName;
    user.phoneNo=formData.phoneNo;
    user.address=formData.address;

    // Ensure you're calling `save()` on a Mongoose document instance
    await user.save();

    return {
      success: true,
      message: 'User Details reset successful.',
      user:user, // Return limited user info
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

  const categoryData=await CATEGORYDB.find();
  try {



    console.log('Category details retrieved successfully:', categoryData);
    return {
      success: true,
      message: 'Category details retrieved successfully.',
      category:categoryData, // Return the populated category details
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

async getCategoryBasedRepo(postId:string){
  try {
  console.log("Id of category",postId)

  console.log(await  CATEGORYDB.findOne({_id:postId}).populate('Events'));

  const SOCIALEVENT=await  CATEGORYDB.findById({_id:postId}).populate('Events');
  console.log("SocialEvent",SOCIALEVENT);
    return {
      success: true,
      message: 'Category details retrieved successfully.',
      category:SOCIALEVENT, // Return the populated category details
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
//again

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
          // Pass the data to the actual repository for database operations
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
        // Pass the data to the actual repository for database operations
        const savedEvent = await this.userRepositoy.getSelectedEventRepository(postId);
        
        return {savedEvent};
    } catch (error) {
        console.error("Error in postEventRepository:", error);
        throw new Error("Failed to handle event data in main repository.");
    }
}

async savePaymentData(paymentData: PaymentData) {
  try {
    // Find the existing booking by ID
    const existingBooking = await BOOKEDUSERDB.findById(paymentData.bookedId);

    if (!existingBooking) {
      return { success: false, message: "Booking not found", data: null };
    }

 
                            
    const validPaymentStatus = (status: string): "Confirmed" | "Cancelled" | "Completed" => {
      if (status === "Success") return "Confirmed";
      if (status === "Cancelled") return "Cancelled";
      if (status === "Completed") return "Completed";
      throw new Error("Invalid payment status received: " + status);
  };
  
  existingBooking.paymentStatus = validPaymentStatus(paymentData.paymentStatus);
    existingBooking.bookingDate = new Date();
    existingBooking.totalAmount = paymentData.Amount;
    existingBooking.NoOfPerson = paymentData.noOfPerson;

    // Save the updated booking
    const updatedBooking = await existingBooking.save();

    return {
      success: true,
      message: "Payment data saved successfully",
      data: updatedBooking,
    };

  } catch (error) {
    console.error("Error saving payment data:", error);
    throw new Error("Database error while saving payment data.");
  }
}



async handleReviewRatingRepo(formData:FormData) {
  try {
      console.log("posting review and rating to the actual repository...");
      // Pass the data to the actual repository for database operations
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
    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userRepositoy.saveUserBilingDetailsRepository(formData);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}

async getEventHistoryRepo(){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.getEventHistoryRepository();
  
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
async getEventBookedRepo(){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.getEventBookedRepository();
  
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





async getManagerDataRepo(userId:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.getBookedManagerRepository(userId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


async createChatSchemaRepo(userId:string,manager:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.userProfileRepository.createChatSchemaRepository(userId,manager);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


















  

    
    

    
}
