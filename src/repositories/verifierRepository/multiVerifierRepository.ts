import { IMultiVerifierRepo } from "../../interfaces/verifierInterfaces/repositoryInterfaces/IMultiVerifierRepo";
import VERIFIERDB from "../../models/verifierModels/verifierSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import { verifierFormData } from "../../dtos/user.dto";
import USERBOOKEDDB from "../../models/userModels/bookingSchema";
export class MultiVerifierRepo implements IMultiVerifierRepo {
    async checkTheVerifierIsActive(email: string) {
        const manager = await VERIFIERDB.findOne({ email: email });
        if (!manager || !manager.isActive) {
            return { success: false, message: 'Manager has not found', data: null }
        }

        const socialEvents = await SOCIALEVENTDB.find({ Manager: manager?._id });

        if (!socialEvents) {
            return { success: false, message: 'Social Events has not found', data: null }

        }
        return { success: true, message: "Manager is Active", data: socialEvents }
    }
    async saveVerifierDetailsRepo(formData: verifierFormData) {
        console.log("Hello");
        console.log("Events", formData.Events);


        const validEvents = formData.Events.filter((event: any) => event.trim() !== "");
        console.log("ValidEvents", validEvents);


        const socialEvents = await SOCIALEVENTDB.find({ eventName: { $in: validEvents } });
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

            return { success: true, message: "Manager will verify your request later", data: { savedVerifier } };
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
        const allEvents = await SOCIALEVENTDB.find({ _id: { $in: verifierDetails.Events } });
        const filteredEvents = allEvents.filter(event => event.title !== "Virtual");

        return {
            success: filteredEvents.length > 0,
            message: filteredEvents.length > 0
                ? "Events are hosted"
                : "No Events hosted in this company",
            data: filteredEvents.length > 0 ? filteredEvents : null
        };
    }
    async fetchAllBookingDetailsRepo(eventId: string) {
        const eventDetails = await USERBOOKEDDB.find({ eventId: eventId });

        if (!eventDetails || eventDetails.length === 0) {
            return { success: false, message: "No booked users in this event", data: null };
        }

        const actualData = eventDetails.filter((event: any) => event.paymentStatus === "Confirmed");

        if (actualData.length === 0) {
            return { success: false, message: "No confirmed bookings", data: null };
        }

        return { success: true, message: "Confirmed booked users found", data: actualData };
    }
    async fetchSingleUserDetailsRepo(bookedId: string, userName: string) {
        const eventDetails = await USERBOOKEDDB.findOne({ bookingId: bookedId });

        if (!eventDetails) {
            return { success: false, message: 'No booked user is in events', data: null };
        }

        const user = eventDetails.bookedUser.find((user: any) => user.user === userName);

        const data = {
            bookingId: eventDetails.bookingId,
            bookingDate: eventDetails.bookingDate,
            firstName: eventDetails.billingDetails?.firstName,
            lastName: eventDetails.billingDetails?.lastName,
            phoneNo: eventDetails.billingDetails?.phoneNo,
            noOfPerson: eventDetails.NoOfPerson,
            totalAmount: eventDetails.totalAmount && eventDetails?.totalAmount / eventDetails.bookedUser.length,
            user: user?.user,
            isParticipated: user?.isParticipated,
            _id: eventDetails._id,
            eventId: eventDetails.eventId,
            ticketDetails: {
                Included: eventDetails.ticketDetails?.Included,
                notIncluded: eventDetails.ticketDetails?.notIncluded,
                type: eventDetails.ticketDetails?.type
            },
            paymentStatus: eventDetails.paymentStatus
        }

        if (user) {
            return { success: true, message: "Fetching Single User Data", data: data };
        }

        // If user not found, return the entire event details
        return { success: true, message: "User not found. Returning full event details.", data: eventDetails };
    }
    async markUserEntryRepo(bookedId: string, userName: string) {
        console.log("Black", bookedId);

        const eventDetails = await USERBOOKEDDB.findOne({ bookingId: bookedId });
        if (!eventDetails) {
            return { success: false, message: 'No booked user is in events', data: null };
        }

        eventDetails.bookedUser.forEach((user: any) => {
            if (user.user === userName) { user.isParticipated = !user.isParticipated; }
        });

        await eventDetails.save();
        const attendanceMessage = eventDetails.bookedUser.some(user => user.isParticipated)
            ? "Marked attendance for participants"
            : "Removed attendance for all participants";

        return { success: true, message: attendanceMessage, data: eventDetails };
    }


}