export interface IUserProfileService {
    getExistingReviewService(userId: string, eventId: string): Promise<{ success: boolean, message: string, data: string | null | undefined | any }>
    posthandleReviewRatingService(formData: FormData): Promise<{ result: any }>;
    getEventHistoryService(userId: string): Promise<{ success: boolean, message: string, data: string | null | undefined | any | number }>;
    getBookedManagerService(userId: string): Promise<{ success: boolean, message: string, data: any }>;
    getEventBookedService(userId: string): Promise<{ success: boolean, message: string, data: string | null | undefined | any | number }>;
    createChatSchemaService(formData: FormData): Promise<{ success: boolean, message: string, data: any }>;
    uploadUserProfilePhoto(userId: string, profilePicture: Express.Multer.File): Promise<{ success: boolean, message: string, data: any }>;
}