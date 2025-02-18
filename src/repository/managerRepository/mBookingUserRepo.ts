import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
export class managerBookingRepository{
    async getTodaysBookingRepository() {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
    
            console.log("Hello", await BOOKEDUSERDB.find());
    
            // Find bookings within today's date range
            const result = await BOOKEDUSERDB.find({
                bookingDate: { $gte: startOfDay, $lte: endOfDay }
            });
    
            console.log("Today's Bookings:", result);
            return { success: true, message: "Today's bookings retrieved successfully", data: result };
        } catch (error) {
            console.error("Error in getTodaysBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async getTotalBookingRepository() {
        try {
            const currentDate = new Date();
            console.log("Current Date:", currentDate);
    
            // Set the start of today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
    
            // Find today's bookings
            const todaysBookings = await BOOKEDUSERDB.find({
                bookingDate: { $gte: startOfDay, $lte: currentDate } // Today's bookings
            });
    
            // Find future bookings
            const futureBookings = await BOOKEDUSERDB.find({
                bookingDate: { $gt: currentDate } // Future bookings
            });
    
            // Combine today's and future bookings
            const allBookings = [...todaysBookings, ...futureBookings];
    
            console.log("Today's Bookings:", todaysBookings);
            console.log("Future Bookings:", futureBookings);
            console.log("All Bookings:", allBookings);
    
            return { success: true, message: "Bookings retrieved successfully", data: allBookings };
        } catch (error) {
            console.error("Error in getTotalBookingRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    
}

