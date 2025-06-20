import MANAGERDB from "../../models/managerModels/managerSchema";
import bcrypt from 'bcrypt';
import { Request } from "express";
import CATEGORYDB from "../../models/adminModels/adminCategorySchema";
import NOTIFICATIONDB from "../../models/userModels/notificationSchema";
import USERDB from "../../models/userModels/userSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import BOOKINGDB from "../../models/userModels/bookingSchema";
const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
interface User {
    email: string;
    password: string; // Password is of type string
  }
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
export class ManagerLoginRepository{
        async isEmailPresentRepo(email: string){
        try {
          const user = await MANAGERDB.findOne({ email });
          return !!user;
        } catch (error) {
          console.error('Error checking email in database:', error);
          throw new Error('Database query failed');
        }
      }
      async postUserDataRepo(formData:{ [key: string]: string }){
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
    async checkManagerLoginRepo(formData: { [key: string]: string }){
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
      
      async isManagerEmailValidRepo(email:string){
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
      async resetPasswordRepoForManagerRepo(email: string, password: string, password1: string) {
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
    async getEventTypeDataRepo(req: Request): Promise<{ success: boolean; message: string; data?: any }> {
      try {
          const result = await CATEGORYDB.find(); // Fetch data from the database
          console.log("DB data", result);
          return { success: true, message: "Event data retrieved successfully", data: result };
      } catch (error) {
          console.error("Error in getEventTypeDataService:", error);
          return { success: false, message: "Internal server error" };
      }
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
async fetchDashboardBarChartRepo(selectedEvent: string) {
  try {
    const socialEvent = await SOCIALEVENTDB.findOne({ eventName: selectedEvent });

    if (!socialEvent) {
      return {
        success: false,
        message: "Event not found",
        data: [],
      };
    }

    // Set date range: today to 6 days ago
    const today = new Date();
 today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    const raw = await BOOKINGDB.find({
  eventId: socialEvent._id.toString(),
  bookingDate: { $gte: sevenDaysAgo, $lte: today }
});
console.log("Raw bookings in 7-day range:", raw);

    const bookings = await BOOKINGDB.aggregate([
      {
        $match: {
          eventId: socialEvent._id,
          bookingDate: {
            $gte: sevenDaysAgo,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map of date => count
    const bookingMap: { [key: string]: number } = {};
    bookings.forEach((b) => {
      bookingMap[b._id] = b.count;
    });

    // Build final result
    const result: { label: string; value: number }[] = [];
for (let i = 0; i < 7; i++) {
  const currentDate = new Date(); 
  currentDate.setUTCHours(0, 0, 0, 0);
  currentDate.setUTCDate(today.getUTCDate() - i);

  const key = currentDate.toISOString().split("T")[0]; // stays in UTC
  result.push({ label: `Day ${i + 1}`, value: bookingMap[key] || 0 });
}


    return {
      success: true,
      message: "7-day booking count (starting today) fetched successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    return {
      success: false,
      message: "Failed to fetch booking details",
      data: [],
    };
  }
}









}