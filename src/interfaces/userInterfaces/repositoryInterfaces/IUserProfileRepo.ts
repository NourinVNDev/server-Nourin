import { FormData } from "../../../dtos/user.dto"

export interface IUserProfileRepo {
    getExistingReviewRepo(userId: string, eventId: string): Promise<{ success: boolean, message: string, data: any }>
    handleReviewRatingRepo(formData: FormData): Promise<{ savedEvent: any }>
    getEventHistoryRepo(userId: string): Promise<{ success: boolean, message: string, data: any }>
    getManagerDataRepo(userId: string): Promise<{ success: boolean, message: string, data: any }>
    getEventBookedRepo(userId: string): Promise<{ success: boolean, message: string, data: any }>
    createChatSchemaRepo(userId: string, manager: string): Promise<{ success: boolean, message: string, data: any }>
    uploadUserProfilePictureRepo(userId: string, profilePicture: string): Promise<{ success: boolean, message: string, data: any }>
}