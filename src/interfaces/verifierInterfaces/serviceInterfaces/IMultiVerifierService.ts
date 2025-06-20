import { verifierFormData } from "../../../dtos/user.dto"

export interface IMultiVerifierService {
    checkIfVerifierActive(email: string): Promise<{ success: boolean, message: string, data: any }>
    verifierLoginDetails(formData: verifierFormData): Promise<{ success: boolean, message: string, data: any }>
    fetchAllEvents(email: string): Promise<{ success: boolean, message: string, data: any }>
    fetchAllBookingDetails(eventId: string): Promise<{ success: boolean, message: string, data: any }>
    fetchSingleUserDetails(bookedId: string, userName: string): Promise<{ success: boolean, message: string, data: any }>
    markUserEntryService(bookedId: string, userName: string): Promise<{ success: boolean, message: string, data: any }>
}