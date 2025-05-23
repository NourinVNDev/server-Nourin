import MANAGERDB from '../../models/managerModels/managerSchema';
import { IMloginRepo } from './IMloginRepo';
import { EventData, eventLocation, EventSeatDetails, OfferData, TicketType, verifierFormData } from '../../config/enum/dto';
import { managerEventRepository } from './mEventRepo';
import { Request,Response } from 'express';
import CATEGORYDB from '../../models/adminModels/adminCategorySchema';
import OFFERDB from '../../models/managerModels/offerSchema';
import { managerOfferRepository } from './mOfferRepo';
import { managerBookingRepository } from './mBookingUserRepo';
import { managerVerifierRepository } from './mVerifierRepo';
import NOTIFICATIONDB from '../../models/userModels/notificationSchema';
import ADMINDB from '../../models/adminModels/adminSchema';
const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
interface User {
    email: string;
    password: string; // Password is of type string
  }
  interface EventDetails {
  eventName: string;
  startDate: string;
  endDate: string;
  time: string;
}

import bcrypt  from 'bcrypt';
import SOCIALEVENTDB from '../../models/managerModels/socialEventSchema';
import USERDB from '../../models/userModels/userSchema';
import BOOKINGDB from '../../models/userModels/bookingSchema';
import { log } from 'node:util';

const hashPassword = async (password:string): Promise<string> => {
  try {
  
      const salt = await bcrypt.genSalt(10); 
      console.log("Sa;t",salt);
   console.log( await bcrypt.hash(password,salt));
   
      const hashedPassword = await bcrypt.hash(password,salt);
      
      console.log('Hashed Password:', hashedPassword);
      return hashedPassword;
  } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
  }
};
export class mLoginRepo implements IMloginRepo{
  private managerEventRepository:managerEventRepository;
  private managerOfferRepository:managerOfferRepository;
  private managerBookingRepository:managerBookingRepository;
  private managerVerifierRepository:managerVerifierRepository
  constructor(){
    this.managerEventRepository=new managerEventRepository();
    this.managerOfferRepository=new managerOfferRepository();
    this.managerBookingRepository=new managerBookingRepository();
    this.managerVerifierRepository=new managerVerifierRepository();
  }
    async isEmailPresent(email: string){
        try {
          const user = await MANAGERDB.findOne({ email });
          return !!user;
        } catch (error) {
          console.error('Error checking email in database:', error);
          throw new Error('Database query failed');
        }
      }
      async postUserData(formData:{ [key: string]: string }){
        try{
            console.log("sneha",formData);
           const hashPassword1= await hashPassword(formData.password);
            
        const newUser  = new MANAGERDB({
            firmName: formData.firmName,
            email: formData.email,
            experience:formData.experience,
            password: hashPassword1,
            phoneNo:formData.phoneNo
          
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
    async checkManagerLogin(formData: { [key: string]: string }){
        const plainPassword = formData.password;
        const user = await MANAGERDB.findOne({ email: formData.email });
      
        if (!user) {
            console.log('User not found.');
            return {
                success: false,
                message: 'User not found.',
                user: null,
            };
        }
      
        const hashedPassword = user.password;
      
        try {
            const isMatch = await bcrypt.compare(plainPassword,hashedPassword);
            if (isMatch) {
                console.log('Password matches!');
                return {
                    success: true,
                    message: 'Login successful.',
                    user:user,
                };
            } else {
                console.log('Password does not match.');
                return {
                    success: false,
                    message: 'Invalid credentials.',
                    user: null,
                };
            }
        } catch (error) {
            console.error('Error comparing password:', error);
            return {
                success: false,
                message: 'An error occurred during login.',
                user: null,
            };
        }
      }
      
      async isManagerEmailValid(email:string){
        try {
          // Check if user exists in the database
          const user:User|null = await MANAGERDB.findOne({email });
      
          if (!user) {
            console.log('Manager not found.');
            return {
              success: false,
              message: 'Manager not found.',
              user: null,
            };
          }
          return {
            success: true,
            message: 'Found successful.',
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
      async resetPasswordRepoForManager(email: string, password: string, password1: string) {
        const confirmPassword = password1;
    
        // Validate input
        console.log("Last checking", password, confirmPassword, email);
    
        if (!email || !password || !confirmPassword) {
            console.log('Email, password, or confirm password is missing.');
            return {
                success: false,
                message: 'Email, password, and confirm password are required.',
                user: null,
            };
        }
    
        // Simple email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format.');
            return {
                success: false,
                message: 'Invalid email format.',
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
            console.log('Checking email:', email);
            // Check if the user exists
            const user = await MANAGERDB.findOne({ email });
            console.log('User ', user);
    
            if (!user) {
                console.log('User  not found.');
                return {
                    success: false,
                    message: 'User  not found.',
                    user: null,
                };
            }
    
            // Hash the new password
            const hashedPassword = await hashPassword(password);
            user.password = hashedPassword;
    
            await user.save();
    
            console.log('Password reset successful.');
            return {
                success: true,
                message: 'Password reset successful.',
             user:user
            };
        } catch (error) {
            console.error('Error during password reset:', error);
            return {
                success: false,
                message: 'An error occurred during password reset.',
                user:{},
            };
        }
    }
      async postEventRepository(formData: EventData,location:eventLocation|null, fileName: string) {
        try {
            console.log("Delegating event data to the actual repository...");
            
            const savedEvent = await this.managerEventRepository.createEventData(formData,location,fileName);
            
            return {
                success: savedEvent.success,
                data: savedEvent.data,
                message: savedEvent.message
            };
        } catch (error) {
            console.error("Error in postEventRepository:", error);
            
            return {
                success: false,
                message: "Failed to handle event data in main repository."
            };
        }
    }

    async   postEventSeatRepository(formData:EventSeatDetails,eventId:string){
      try {

        
        // Pass the data to the actual repository for database operations
        const savedEvent = await this.managerEventRepository.createEventSeatInfo(formData, eventId);
        
        return {
            success: true,
            data: savedEvent.data,
            message: "Event successfully saved."
        };
    } catch (error) {
        console.error("Error in postEventRepository:", error);
        
        return {
            success: false,
            message: "Failed to handle event data in main repository."
        };
    } 
    }
    

    async postUpdateEventRepository(formData: EventData, fileName: string[],eventId:string,location:eventLocation|null) {
      try {
          console.log("Delegating event data to the actual repository...");
          // Pass the data to the actual repository for database operations
          const savedEvent = await this.managerEventRepository.updateEventData(formData,location,fileName,eventId);
          return {
            success: true,
            data: savedEvent.data,
            message: "Event successfully saved."
        };
      } catch (error) {
          console.error("Error in postEventRepository:", error);
          throw new Error("Failed to handle event data in main repository.");
      }
  }

    
    async getEventTypeData(req: Request): Promise<{ success: boolean; message: string; data?: any }> {
      try {
          const result = await CATEGORYDB.find(); // Fetch data from the database
          console.log("DB data", result);
          return { success: true, message: "Event data retrieved successfully", data: result };
      } catch (error) {
          console.error("Error in getEventTypeDataService:", error);
          return { success: false, message: "Internal server error" };
      }
  }


  async getSearchOfferInput(searchData:string): Promise<{ success: boolean; message: string; data?: any }> {
    try {

      const savedEvent =await this.managerOfferRepository.getSearchOfferInput(searchData);
  
        return { success: true, message: "Event data retrieved successfully", data: savedEvent };
    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Internal server error" };
    }
}

  async getAllOfferDetails(managerId:string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const result = await OFFERDB.find({managerId:managerId}); // Fetch data from the database
        console.log("DB data", result);
        return { success: true, message: "Event data retrieved successfully", data: result };
    } catch (error) {
        console.error("Error in getEventTypeDataService:", error);
        return { success: false, message: "Internal server error" };
    }
}



async postOfferDetails(formData: OfferData) {
  try {
    const result=await this.managerOfferRepository.addNewOfferRepository(formData);    // Extract fields from formData
    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Error in postOfferDetails:", error);
    return { success: false, message: "Internal server error" };
  }
}



async updateOfferDetailsRepo(formData:OfferData): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerOfferRepository.updateOfferRepository(formData);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchManagerWalletRepo(managerId:string){
  try {

   
    const savedEvent = await this.managerOfferRepository.fetchManagerWalletRepository(managerId);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in User Wallet Repository:", error);
    throw new Error("Failed to handle user wallet in main repository.");
}
}
async fetchAllCompanyEventRepo(CompanyName: string) {
  const eventDetails = await SOCIALEVENTDB.find({ companyName: CompanyName });
  if (!eventDetails || eventDetails.length === 0) {
      return { success: false, message: "No Events hosted in this company", data: null };
  }
  const actualEvents = eventDetails.filter((event: any) => new Date(event.endDate) > new Date());

  console.log("Actual Events:", actualEvents);

  if (actualEvents.length === 0) {
      return { success: false, message: "No upcoming events in this company", data: null };
  }

  return { success: true, message: "Upcoming events found", data: actualEvents.map((event: any) => event.eventName) };
}


async getManagerProfileRepo(companyName: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ firmName: companyName }); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager profile not found" ,data:null};
    }

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}


async updateManagerProfileRepo(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ email:formData.email}); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager email not found" ,data:null};
    }

    result.phoneNo=formData.phoneNo;
    await result.save();

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}




async updateManagerPasswordRepo(formData:{[key:string]:string}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const result = await MANAGERDB.findOne({ email:formData.email}); // Fetch data from the database
    
    if (!result) {
      console.log("isError");
      
      return { success: false, message: "Manager email not found" ,data:null};
    }

    result.password = await hashPassword(formData.newPassword);
    await result.save();

    console.log("DB data", result);
    return { success: true, message: "Event data retrieved successfully", data: result };
  } catch (error) {
    console.error("Error in getManagerProfileRepo:", error);
    return { success: false, message: "Internal server error" };
  }
}
async getAllEventRepo(managerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerEventRepository.getAllEventDetailsRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}


async getSelectedEventRepo(id:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerEventRepository.getSelectedEventRepository(id);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}
async getSelectedEventTicketRepo(id:string){
  try {

    const savedEvent =await this.managerEventRepository.getSelectedEventTicketRepository(id);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getSelectedOfferRepo(offerId:string): Promise<{ success: boolean; message: string; data?: any }> {
  try {

    const savedEvent =await this.managerOfferRepository.getSelectedOfferRepository(offerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getAllVerifierRepo(managerName:string){
  try {

    const savedEvent =await this.managerVerifierRepository.getAllVerifierRepository(managerName);

      return { success: true, message: "Verifier data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in get  verifier details service:", error);
      return { success: false, message: "Internal server error" };
  }

}
async updateVerifierStatusRepo(verifierId:string){
  try {

    const savedEvent =await this.managerVerifierRepository.updateVerifierStatusRepository(verifierId);

      return { success: true, message: "update verifier status successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async postVerifierLoginRepo(formData:verifierFormData){
  try {
console.log("Form from Repo",formData);

    const savedEvent =await this.managerVerifierRepository.postVerifierLoginRepository(formData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async updateVerifierRepo(formData:verifierFormData){
  try {

    const savedEvent =await this.managerVerifierRepository.updateVerifierRepository(formData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchSelectedVerifierRepo(verifierId:string){
  try {

    const savedEvent =await this.managerVerifierRepository.fetchSelectedVerifierRepository(verifierId);

      return { success: true, message: "Verifier data fetched successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in fetching  verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async updateSeatInformationRepo(ticketData:TicketType){
  try {

    const savedEvent =await this.managerEventRepository.updateSeatInformationRepository(ticketData);

      return { success: true, message: "Verifier data saved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in updating status of verifier Service:", error);
      return { success: false, message: "Internal server error" };
  }
}
async fetchManagerNotificationRepo(managerId: string) {
  try {
    const notificationData = await NOTIFICATIONDB.find({
      toModal: 'Manager',
      to: managerId
    }).sort({ createdAt: -1 });

    if (!notificationData || notificationData.length === 0) {
      return {
        success: true,
        message: "No notifications on the manager side",
        data: [],
      };
    }

  
    const notificationIds = notificationData.map((n: any) => n._id);
     if (notificationIds.length > 0) {
    await NOTIFICATIONDB.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isRead: true } }
    );
  }


    const enrichedNotifications = await Promise.all(
      notificationData.map(async (notification: any) => {
        let senderName = '';
        let senderImage = null;

        if (notification.fromModal === 'bookedUser') {
          const user = await USERDB.findById(notification.from);
          if (user) {
            senderName = `${user.firstName} ${user.lastName}`;
            senderImage = user.profilePhoto || null;
          }
        }


        console.log("Doc:",notification._doc,);

        console.log("SenderName,Image",senderImage,senderName);
        
        return {
          ...notification._doc,
          senderName,
          senderImage,
        };
      })
    );

    return {
      success: true,
      message: "Notifications retrieved successfully",
      data: enrichedNotifications,
    };

  } catch (error) {
    console.error("Error fetching manager notifications:", error);
    return {
      success: false,
      message: "Internal server error"
    };
  }
}


async fetchManagerNotificationCountRepo(managerId: string) {
  try {
    const notificationCount = await NOTIFICATIONDB.countDocuments({
      to: managerId,
      isRead: false
    });
    console.log("Notification:",notificationCount);
    // const categoryNotificationCount = await NOTIFICATIONDB.countDocuments({
    //   toModal: "Manager",
    //   isRead: false
    // });
    // console.log('CategoryNOtificationCOunt',categoryNotificationCount);
    const totalNotificationCount=notificationCount
    // +categoryNotificationCount;
    console.log("Total Count of Notificaton in manager side",totalNotificationCount);
    return {
      success: true,
      message: "Notification counts fetched successfully",
      data: 
   totalNotificationCount
    };
  } catch (error) {
    console.error("Error in updating notification:", error);
    return {
      success: false,
      message: "Internal server error"
    };
  }
}

async  checkValidDateRepo(eventName: string) {
  try {
    console.log("Event Name from repo", eventName);

    const event: EventDetails | null = await SOCIALEVENTDB.findOne({ eventName });

    if (!event) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    const now = new Date();

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const isDateInRange = now >= start && now <= end;

    const [hours, minutes] = event.time.split(":").map(Number);
    const eventStartDateTime = new Date(event.startDate);
    eventStartDateTime.setHours(hours, minutes, 0, 0);

    const earliestEntryTime = new Date(eventStartDateTime.getTime() - 10 * 60000);
    const isEntryAllowed = now >= earliestEntryTime;

    if (!isDateInRange) {
      return {
        success: false,
        message: "Today's date is not within the event's valid date range",
      };
    }

    if (!isEntryAllowed) {
      return {
        success: false,
        message: "You can only enter starting from 10 minutes before the event starts",
      };
    }

    return {
      success: true,
      message: "Date and time are valid for entry",
    };

  } catch (error) {
    console.error("Error in checking Date for video call:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}


async fetchUserCountAndRevenueRepo(managerId: string) {
  try {
    const socialEvents = await SOCIALEVENTDB.find({ Manager: managerId });
    const eventIds = socialEvents.map((event: any) => event._id);
    const userData = await BOOKINGDB.find({ eventId: { $in: eventIds } }).populate('userId');
    
    console.log("User Data", userData);
    
    if (!userData || userData.length === 0) {
      return { success: false, message: 'No Booked User', data: null };
    }
    
    const userCount = new Set();
    userData.forEach((booking: any) => {
      console.log("Name:", booking.userId.firstName);
      userCount.add(booking.userId.firstName);
    });
    
    console.log("COUNT", userCount);

    const totalUserCount = userCount.size;
    const totalRevenue = userData.reduce((acc: number, booking: any) => {
      return acc + (booking.totalAmount || 0);
    }, 0);

    console.log("Total", totalUserCount, totalRevenue);

    return {
      success: true,
      message: 'Fetch User Count and Revenue Successfully',
      data: {
        totalUserCount,
        totalRevenue
      }
    };

  } catch (error) {
    console.error("Error fetching user count and revenue:", error);
    throw error;
  }
}

async fetchDashboardGraphRepo(
  managerId: string,
  selectedType: string,
  selectedTime: string
) {

  try {
    const manager = await MANAGERDB.findOne({ _id: managerId });
    const socialEvents = await SOCIALEVENTDB.find({ Manager: manager?._id });
  
    const eventIds = socialEvents.map(event => event._id);

    const matchStage: any = {
      eventId: { $in: eventIds }
    };
    const pipeline: any[] = [];

    // For yearly report
    if (selectedTime === 'Yearly') {
      pipeline.push(
        { $match: matchStage },
        {
          $group: {
            _id: { $month: '$bookingDate' },
            value:
              selectedType === 'Booking'
                ? { $sum: 1 }
                : { $sum: '$totalAmount' }
          }
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            value: 1
          }
        }
      );
    }

    // For monthly report (weekly breakdown)
    else if (selectedTime === 'Monthly') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      pipeline.push(
        {
          $match: {
            ...matchStage,
            bookingDate: { $gte: startOfMonth }
          }
        },
        {
          $addFields: {
            week: {
              $ceil: { $divide: [{ $dayOfMonth: '$bookingDate' }, 7] }
            }
          }
        },
        {
          $group: {
            _id: '$week',
            value:
              selectedType === 'Booking'
                ? { $sum: 1 }
                : { $sum: '$totalAmount' }
          }
        },
        {
          $project: {
            _id: 0,
            week: '$_id',
            value: 1
          }
        }
      );
    }

    const result = await BOOKINGDB.aggregate(pipeline);

    // Format the result
    let formattedData = result.map((item: any) => {
      if (selectedTime === 'Yearly') {
        return {
          month: monthMap[item.month - 1],
          [selectedType === 'Booking' ? 'bookings' : 'revenue']: item.value
        };
      } else {
        return {
          week: `Week ${item.week}`,
          [selectedType === 'Booking' ? 'bookings' : 'revenue']: item.value
        };
      }
    });

    // Fill missing months with zeroes for yearly
    if (selectedTime === 'Yearly') {
      const filledData = monthMap.map((month) => {
        const found = formattedData.find((d) => d.month === month);
        return (
          found || {
            month,
            [selectedType === 'Booking' ? 'bookings' : 'revenue']: 0
          }
        );
      });
      formattedData = filledData;
    }

    return {
      success: true,
      message: 'Graph data fetched successfully',
      data: formattedData
    };
  } catch (error) {
    console.error('Error fetching dashboard graph data:', error);
    return {
      success: false,
      message: 'Failed to fetch graph data',
      data: []
    };
  }
}


async fetchDashboardPieChartRepo(managerId: string) {
  try {
    const manager = await MANAGERDB.findById(managerId);
    if (!manager) {
      return { success: false, message: "Manager not found", data: null };
    }

    const socialEvents = await SOCIALEVENTDB.find({ companyName: manager.firmName });
    const eventIdToNameMap = new Map();
    const eventIds = socialEvents.map((event: any) => {
      eventIdToNameMap.set(event._id.toString(), event.eventName);
      return event._id;
    });

    const bookingData = await BOOKINGDB.find({ eventId: { $in: eventIds } });

    // Count bookings per eventId
    const bookingCounts: { [key: string]: number } = {};
    bookingData.forEach((booking: any) => {
      const id = booking.eventId.toString();
      bookingCounts[id] = (bookingCounts[id] || 0) + 1;
    });

    // Map to eventName and sort descending
    const eventBookingSummary = Object.entries(bookingCounts)
      .map(([eventId, count]) => ({
        eventName: eventIdToNameMap.get(eventId) || "Unknown Event",
        noOfBookings: count,
      }))
      .sort((a, b) => b.noOfBookings - a.noOfBookings);

    return {
      success: true,
      message: "Top booked events retrieved",
      data: eventBookingSummary,
    };
  } catch (error) {
    console.error("Error in fetchDashboardPieChartRepo:", error);
    return { success: false, message: "Internal server error", data: null };
  }
}





async getTodaysBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTodaysBookingRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }
}

async getTotalBookingRepo(managerId:string):Promise<{ success: boolean; message: string; data?: any }>{
  try {

    const savedEvent =await this.managerBookingRepository.getTotalBookingRepository(managerId);

      return { success: true, message: "Event data retrieved successfully", data: savedEvent };
  } catch (error) {
      console.error("Error in getEventTypeDataService:", error);
      return { success: false, message: "Internal server error" };
  }

}

async getUserDataRepo(managerName:string){
  try {


    const savedEvent = await this.managerBookingRepository.getBookedUserRepository(managerName);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}

}

async createChatSchemaRepo(sender:string,receiver:string){
  try {

    // Pass the data to the actual repository for database operations
    const savedEvent = await this.managerBookingRepository.createChatSchemaRepository(sender,receiver);
  
    return {success:savedEvent.success,message:savedEvent.message,data:savedEvent.data};
} catch (error) {
    console.error("Error in postEventRepository:", error);
    throw new Error("Failed to handle event data in main repository.");
}
}


}