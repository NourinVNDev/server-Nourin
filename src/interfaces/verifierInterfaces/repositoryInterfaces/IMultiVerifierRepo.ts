import { verifierFormData } from "../../../dtos/user.dto"

export interface IMultiVerifierRepo {
    checkTheVerifierIsActive(email: string): Promise<{ success: boolean, message: string, data: any }>
    saveVerifierDetailsRepo(formData: verifierFormData): Promise<{ success: boolean, message: string, data: any }>
    fetchAllCompanyEventRepo(email: string): Promise<{ success: boolean, message: string, data: any }>
    fetchAllBookingDetailsRepo(eventId: string): Promise<{ success: boolean, message: string, data: any }>
    fetchSingleUserDetailsRepo(bookedId: string, userName: string): Promise<{ success: boolean, message: string, data: any }>
    markUserEntryRepo(bookedId: string, userName: string): Promise<{ success: boolean, message: string, data: any }>

}