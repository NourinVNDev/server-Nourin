import { FormData } from "../../../dtos/user.dto";
import { eventLocation } from "../../../dtos/user.dto";
export interface IUserLoginRepo {
    getEventDataRepo(): Promise<{ success: boolean, message: string, data: any }>;
    checkLogin(formData: FormData): Promise<{ success: boolean, message: string, user: any }>;
    isEmailPresent(email: string): Promise<{ user: boolean }>;
    postUserData(formData: FormData): Promise<{ success: boolean, message: string, user: any }>;
    googleAuthData(payload: Object): Promise<{ success: boolean, message: string, user: any }>;
    isEmailValid(email: string): Promise<{ success: boolean, message: string, user: any }>;
    getCategoryTypeRepo(categoryName: string): Promise<{ success: boolean, message: string, category: any }>//1
    getAllCategoryRepository(): Promise<{ success: boolean, message: string, category: any }>//3
    getUserDetailsRepository(userId: string): Promise<{ success: boolean, message: string, user?: any, category?: any }>//2
    resetUserProfile(email: string, formData: FormData, location: eventLocation | null): Promise<{ success: boolean, message: string, user: any }>//4
    resetPasswordRepo(email: string, formData: FormData): Promise<{ success: boolean, message: string, user: any }>;//4
    getAllEventBasedRepo(): Promise<{ success: boolean, message: string, category: any[] }>
    fetchuserEmail(userId: string): Promise<{ success: boolean, message: string, user: any }>
    checkOfferAvailableRepo(categoryName:string):Promise<{success:boolean,message:string,data:any}>
}