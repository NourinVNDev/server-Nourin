import { FormData } from "../../config/enum/dto";
import BOOKEDUSERDB from "../../models/userModels/bookingSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import CONVERSATIONDB from "../../models/userModels/conversationSchema";
import mongoose from "mongoose";
import REVIEWRATINGDB from "../../models/userModels/reveiwRatingSchema";
import USERDB from "../../models/userModels/userSchema";
import MESSAGEDB from "../../models/userModels/messageSchema";
import { eventNames } from "process";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
export class userProfileRepository {
    async postReviewRatingRepository(formData: FormData) {
        const eventId = formData.eventId;
        const userId = formData.userId;
        const reviewText = formData.review;
        const rating = formData.rating;

        try {
            // Check if a review and rating already exist for this user and event
            const result = await REVIEWRATINGDB.find({ userId, eventId }); // Corrected this line

            if (result && result.length > 0) {
                // If the result exists, update the review and rating
                const updatedReview = await REVIEWRATINGDB.updateOne(
                    { userId, eventId },
                    {
                        reviewText: reviewText,
                        rating: rating
                    }
                );
                console.log("Review and rating updated:", updatedReview);
                return updatedReview;  // Returning the updated review and rating
            } else {
                // If no existing review, create a new one
                const newReview = await REVIEWRATINGDB.create({
                    userId,
                    eventId,
                    reviewText,
                    rating,
                });
                console.log("New review and rating created:", newReview);
                return newReview;  // Returning the newly created review and rating
            }
        } catch (error) {
            console.error("Error in posting review and rating:", error);
            throw new Error("Failed to post review and rating");
        }
    }


    async getEventHistoryRepository(userId: string) {
        const result = await BOOKEDUSERDB.find({ userId: userId }).populate('eventId');

        console.log("Result:", result);

        // Ensure eventId is properly typed
        const filteredResult = result.filter(event => {
            const eventData = event.eventId as { endDate?: Date }; // Type assertion
            return eventData.endDate && eventData.endDate < new Date();
        });


        console.log('Setting', filteredResult);
        if (!filteredResult) {
            return { success: false, message: 'Empty Event History', data: null };
        }
        return { success: true, message: "Data retrives", data: filteredResult };
    }



    async getExistingReviewRepository(userId: string, eventId: string) {
        try {
            // Convert userId and eventId to ObjectId
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const eventObjectId = new mongoose.Types.ObjectId(eventId);


            console.log("Checking the IDs", userObjectId, eventObjectId)

            // Fetch only the documents that match both userId and eventId
            const result = await REVIEWRATINGDB.find({ userId: userObjectId, eventId: eventObjectId });
            console.log('Result', result)
            if (!result.length) {
                return { success: true, message: "No review is  added", data: [] };
            }

            const reviewData = result[0];

            return {
                success: true,
                message: "Data retrieved",
                data: {
                    review: reviewData.reviewText,
                    rating: reviewData.rating
                }
            };
        } catch (error) {
            console.error("Error in getting review details", error);
            throw new Error("Failed to retrieve review and rating data.");
        }
    }

    async getEventBookedRepository(userId: string) {
        try {
            const rawResult = await BOOKEDUSERDB.find({ userId: userId }).lean();
            console.log("Raw Data (Before Populate):", JSON.stringify(rawResult, null, 2));

            // Ensure `eventId` is properly populated
            const result = await BOOKEDUSERDB.find({ userId: userId })
                .populate({ path: 'eventId', model: 'SocialEvent' })
                .lean();

            console.log("Populated Data:", JSON.stringify(result, null, 2));

            const filteredResult = result.filter(event => {
                console.log("Event ID Type:", typeof event.eventId, "Value:", event.eventId);


                const eventData = event.eventId && typeof event.eventId === 'object' && 'endDate' in event.eventId
                    ? event.eventId as { endDate: string }
                    : null;

                if (!eventData) {
                    console.log("Skipping Event - Missing endDate:", event);
                    return false;
                }

                const eventDate = new Date(eventData.endDate);
                const currentDate = new Date();

                console.log("Checking Event Date:", eventDate, "Current Date:", currentDate);

                return eventDate.getTime() >= currentDate.getTime();
            });

            console.log('Filtered Events:', filteredResult);

            return filteredResult.length === 0
                ? { success: false, message: 'Empty Event History', data: null }
                : { success: true, message: "Data retrieved", data: filteredResult };

        } catch (error) {
            console.error("Error in getting booked details:", error);
            throw new Error("Failed to process manager-specific event logic.");
        }
    }












    async getBookedManagerRepository(userId: string) {
        try {
            const conversations = await CONVERSATIONDB.find({
                participants: userId
            });

            if (!conversations.length) {
                return {
                    success: false,
                    message: "No conversations found",
                    data: null
                };
            }
            const result = []
            for (const convo of conversations) {
                const managerId = convo.participants.find(
                    (id: any) => id.toString() !== userId
                );
                const eventsData = await SOCIALEVENTDB.find({ Manager: managerId })
                    .select("eventName companyName")
                    .lean();
                if (!eventsData.length) continue;
                const companyName = eventsData[0].companyName;
                const events = eventsData.map(ev => ev.eventName);
                let lastMessage = null;
                const message = await MESSAGEDB.findById(convo.lastMessage).lean();
                if (message) {
                    lastMessage = {
                        message: message.message,
                        time: message.createdAt,
                    };
                }
                console.log(JSON.stringify(convo._id),"managerId")
                const unreadCount = await MESSAGEDB.countDocuments({
                            chatId:convo._id,
                            senderId:managerId,
                            isRead: false
                        });
                result.push({
                    chatId: convo._id,
                    companyName,
                    events,
                    lastMessage,
                    unreadCount
                })
            }
                console.log(result,"resultData---------")
                return {
                    success: true,
                    message: "Chatted manager event data retrieved",
                    data: result
                }
        } catch (error) {
            console.error("Error fetching chatted manager events:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }




    async createChatSchemaRepository(userId: string, manager: string) {
        try {
            console.log("Checking", manager);

            const Manager = await MANAGERDB.findOne({ firmName: manager });
            console.log("Manager Details", Manager);

            if (!Manager) {
                return { success: false, message: "Manager not found", data: null };
            }

            const managerId = new mongoose.Types.ObjectId(Manager._id);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            console.log("gfd", managerId, userObjectId);

            let conversation = await CONVERSATIONDB.findOne({
                participants: { $all: [userObjectId, managerId] }
            });

            if (!conversation) {
                conversation = new CONVERSATIONDB({
                    participants: [userObjectId, managerId] // Store ObjectIds
                });
                await conversation.save();
            }

            
            const getAllMessages = await MESSAGEDB.find({ chatId: conversation._id });
            const messageCount = await MESSAGEDB.find({ senderId: managerId });
            await Promise.all(messageCount.map(async (message) => {
                message.isRead = true;
                await message.save();
            }));


            return { success: true, message: "Conversation Schema Created", data: { conversation: conversation, managerId: Manager._id, allMessages: getAllMessages } };
        } catch (error) {
            console.error("Error fetching company names:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }



    async uploadUserProfilePictureRepository(userId: string, profilePicture: string) {
        try {
            // Find the user
            const user = await USERDB.findById(userId);

            if (!user) {
                return { success: false, message: "User not found", data: null };
            }

            // Update profile picture
            user.profilePhoto = profilePicture;
            await user.save();

            return { success: true, message: "Profile Photo Uploaded", data: user.profilePhoto };
        } catch (error) {
            console.error("Error uploading profile photo:", error);
            return { success: false, message: "Internal server error", data: null };
        }
    }
















}