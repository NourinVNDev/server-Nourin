import { IVerifierRepo } from "./IVerifierRepo";
import SOCIALEVENTSDB from "../../models/managerModels/socialEventSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import VERIFIERDB from "../../models/verifierModals/verifierSchema";
import { verifierFormData } from "../../config/enum/dto";
import bcrypt from 'bcrypt';
import BOOKINGDB from "../../models/userModels/bookingSchema";
import mongoose from "mongoose";
const hashPassword = async (password: string) => {
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
export class verifierDetailsRepository implements IVerifierRepo {
    async checkTheVerifierIsActive(email: string) {
        const manager = await VERIFIERDB.findOne({ email: email });
        if (!manager) {
            return { success: false, message: 'Manager has not found', data: null }
        }

        const socialEvents = await SOCIALEVENTSDB.find({ Manager: manager?._id });

        if (!socialEvents) {
            return { success: false, message: 'Social Events has not found', data: null }

        }
        return { success: true, message: "Manager is Active", data: socialEvents }
    }
    async saveVerifierDetailsRepo(formData: verifierFormData) {
        console.log("Hello");
        console.log("Events", formData.Events);
    
        // Remove empty events
        const validEvents = formData.Events.filter((event:any) => event.trim() !== "");
        console.log("ValidEvents", validEvents);
    
        // Fetch matching events by name
        const socialEvents = await SOCIALEVENTSDB.find({ eventName: { $in: validEvents } });
        console.log("Social Events:", socialEvents);
    
        if (!socialEvents.length) {
            return { success: false, message: 'No matching events found', data: null };
        }
    
        // Convert event documents' _id to ObjectId array
        const eventIds = socialEvents.map(event => event._id.toString()); // Convert to string if needed
        console.log("Event IDs:", eventIds);
    
        const newVerifier = new VERIFIERDB({
            verifierName: formData.verifierName,
            email: formData.email,
            Events: eventIds, // Ensure these are ObjectIds
            companyName: formData.companyName,
            status: 'pending'
        });
    
        try {
            console.log('Saving new verifier123:', newVerifier);
            const savedVerifier = await newVerifier.save();
            console.log('Verifier saved:', savedVerifier);
    
            const manager = await MANAGERDB.findOne({ firmName: savedVerifier.companyName });
            if (manager && savedVerifier) {
                manager.verifier.push(savedVerifier._id.toString());
                await manager.save();
            }
    
            return { success: true, message: "Manager will verify your request later", data: {savedVerifier} };
        } catch (error) {
            console.error('Error while saving new verifier:', error);
            return { success: false, message: 'Failed to save verifier', data: null };
        }
    }
    
    
    async fetchAllCompanyEventRepo(email: string) {
        const verifierDetails = await VERIFIERDB.findOne({ email });
    
        if (!verifierDetails || !verifierDetails.Events || verifierDetails.Events.length === 0) {
            return { success: false, message: "No events found for this company", data: null };
        }
    
        const validateEvents = verifierDetails.Events.map((event: any) => event); 
    
        const socialEvents = await SOCIALEVENTSDB.find({ _id: { $in: validateEvents } });
    
        return { 
            success: socialEvents.length > 0, 
            message: socialEvents.length > 0 ? "Events are hosted" : "No Events hosted in this company", 
            data: socialEvents.length > 0 ? socialEvents : null 
        };
    }
    

    async fetchAllBookingDetailsRepo(eventId: string) {
        const eventDetails = await BOOKINGDB.find({ eventId: eventId });
    
        if (!eventDetails || eventDetails.length === 0) {
            return { success: false, message: "No booked users in this event", data: null };
        }
    
        const actualData = eventDetails.filter((event: any) => event.paymentStatus === "Confirmed");
    
        if (actualData.length === 0) {
            return { success: false, message: "No confirmed bookings", data: null };
        }
    
        return { success: true, message: "Confirmed booked users found", data: actualData };
    }
    

    async markUserEntryRepo(bookedId: string) {
        const eventDetails = await BOOKINGDB.findOne({ bookingId: bookedId });
        if (!eventDetails) {
            return { success: false, message: 'No booked user is in events', data: null };
        }
    
        eventDetails.bookedUser .forEach((user: any) => {
            user.isParticipated = !user.isParticipated; 
        });
    
        await eventDetails.save();
        const attendanceMessage = eventDetails.bookedUser .some(user => user.isParticipated)
            ? "Marked attendance for participants"
            : "Removed attendance for all participants";
    
        return { success: true, message: attendanceMessage, data: eventDetails };
    }




}
