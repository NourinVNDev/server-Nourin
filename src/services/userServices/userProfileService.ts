import { injectable, inject } from "inversify";
import { IUserProfileService } from "../../interfaces/userInterfaces/serviceInterfaces/IUserProfileService";
import TYPES from "../../inversify/types";
import { IUserProfileRepo } from "../../interfaces/userInterfaces/repositoryInterfaces/IUserProfileRepo";
import { FormData } from "../../dtos/user.dto";
import { uploadToCloudinary } from "../../config/cloudinary.config";
@injectable()
export class UserProfileService implements IUserProfileService {
    constructor(
        @inject(TYPES.IUserProfileRepo) private _userProfileRepo: IUserProfileRepo
    ) { }
    async getExistingReviewService(userId: string, eventId: string) {
        try {
            // Fetch data from the repository
            const savedEvent = await this._userProfileRepo.getExistingReviewRepo(userId, eventId);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
            // return {success:result.success,message:result.message,data:result.data};
        } catch (error) {

            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

    async posthandleReviewRatingService(formData: FormData) {
        try {
            if (!formData.review || !formData.rating) {
                console.error("Missing review or rating.");
                throw new Error("Review and Rating are required for liking the post.");
            }


            if (!formData.eventId || !formData.userId) {
                console.error("Missing eventId or userId:", formData);
                throw new Error("EventId and userId are required for liking the post.");
            }


            console.log("Valid form data:", formData);
            const result = await this._userProfileRepo.handleReviewRatingRepo(formData);
            console.log("from service", result);
            //  return { success: result.success, message: result. message, data: result.data };
            return { result };
        } catch (error) {
            // Log and return a generic error response
            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }
    async getEventHistoryService(userId: string) {
        try {
            // Fetch data from the repository
            const savedEvent = await this._userProfileRepo.getEventHistoryRepo(userId);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
            // return {success:result.success,message:result.message,data:result.data};
        } catch (error) {
            // Log and return a generic error response
            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

    async getBookedManagerService(userId: string) {
        try {

            const savedEvent = await this._userProfileRepo.getManagerDataRepo(userId);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };

        } catch (error) {

            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }
    async getEventBookedService(userId: string) {
        try {
            // Fetch data from the repository
            const savedEvent = await this._userProfileRepo.getEventBookedRepo(userId);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };
            // return {success:result.success,message:result.message,data:result.data};
        } catch (error) {
            // Log and return a generic error response
            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

    async createChatSchemaService(formData: FormData) {
        try {
            const { userId, manager } = formData;
            if (!userId) {
                return { success: false, message: 'User is not Found', data: null };
            }
            if (!manager) {
                return { success: false, message: 'Manager is not Found', data: null };
            }

            const savedEvent = await this._userProfileRepo.createChatSchemaRepo(userId, manager);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };

        } catch (error) {

            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }

    async uploadUserProfilePhoto(userId: string, profilePicture: Express.Multer.File) {
        try {

            if (!userId) {
                return { success: false, message: 'User is not Found', data: null };
            }

            const fileName = await uploadToCloudinary(profilePicture);
            // Fetch data from the repository
            const savedEvent = await this._userProfileRepo.uploadUserProfilePictureRepo(userId, fileName as string);
            return { success: savedEvent.success, message: savedEvent.message, data: savedEvent.data };

        } catch (error) {
            // Log and return a generic error response
            console.error("Error in getAllOfferServiceDetails:", error);
            throw new Error("Failed to create event in another service layer.");
        }
    }



}