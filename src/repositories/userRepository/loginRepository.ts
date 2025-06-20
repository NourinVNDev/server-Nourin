import SOCIALEVENT from "../../models/managerModels/socialEventSchema";
import { FormData,User } from "../../dtos/user.dto";
import USERDB from "../../models/userModels/userSchema";
import bcrypt from 'bcrypt'
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import { eventLocation } from "../../dtos/user.dto";
import { IUserLoginRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IUserLoginRepo";
import ADMINOFFER from "../../models/adminModels/adminOfferSchema";
import MANAGEROFFER from "../../models/managerModels/managerOfferSchema";
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
export class UserLoginRepository implements IUserLoginRepo{
      async getEventDataRepo(){
    try {
      const result=await SOCIALEVENT.find();
      return{success:true,message:"Evennt Data Retrieved",data:result}
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


    const isMatch = await bcrypt.compare(plainPassword, user.password);

    const categoryData = await CATEGORYDB.find();
    const categoryNames = categoryData.map((category) => category.categoryName);
    
    console.log(categoryNames);

    const offers = await ADMINOFFER.find({ endDate: { $lt: new Date() } });

    for (const offer of offers) {
      const socialEvents = await SOCIALEVENT.find({ adminOffer: offer._id });
    
      for (const event of socialEvents) {
        event.typesOfTickets.forEach((ticket: any) => {
          ticket.offerDetails = {};
        });
    
        event.adminOffer = undefined;
    
        await event.save();
    
        await ADMINOFFER.updateOne(
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
 async isEmailPresent(email: string){
    try {
      const user = await USERDB.findOne({ email });
      return { user: !!user }; 
    } catch (error) {
      console.error('Error checking email in database:', error);
      throw new Error('Database query failed');
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
    const user = await USERDB.findOne({email:email});

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
async getAllEventBasedRepo(): Promise<any> {
  try {
    const eventData = await SOCIALEVENT.find();
    const updatedEvents: any[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const event of eventData) {
      const eventStartDate = new Date(event.startDate);
      eventStartDate.setHours(0, 0, 0, 0);

      if (eventStartDate >= today) {
        const category = await CATEGORYDB.findOne({ categoryName: event.title });

        if (category && category.isListed) {
          console.log("Title",event.eventName,category.categoryName);
          
          // Fetch active manager offer for the event

          console.log("MaNaGeR",await MANAGEROFFER.find());
          
          const managerOffer = await MANAGEROFFER.findOne({
            discount_on: event.eventName,
            startDate: { $lte: today },
            endDate: { $gte: today },
          });
          console.log("ManagerOffer",managerOffer); 
          // Fetch active admin offer for the category

     
          
          const adminOffer = await ADMINOFFER.findOne({
            discount_on: category.categoryName,
            startDate: { $lte: today },
            endDate: { $gte: today },
          });

          console.log("AdminOffer",adminOffer);
          

          updatedEvents.push({
            ...event.toObject(),
            managerOffer1: managerOffer || null,
            adminOffer1: adminOffer || null,
          });
        }
      }
    }

    return {
      success: true,
      message: "Event Details with Offers retrieved successfully.",
      events: updatedEvents,
    } as const;
  } catch (error) {
    console.error("Error retrieving event and offer details:", error);
    return {
      success: false,
      message: "An error occurred while retrieving event and offer data.",
      events: [],
    } as const;
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
async checkOfferAvailableRepo(categoryName: string) {
  try {
    const savedEvent = await ADMINOFFER.findOne({ discount_on: categoryName });
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




}