import { billingData, PaymentData, retryBillingData, retryPayment } from "../../../dtos/user.dto"

export interface IEventBookingRepo {
    postHandleLikeRepo(index: string, userId: string, postId: string): Promise<{ result: any }>
    getPostDetailsRepo(postId: string): Promise<{ singleEvent: any }>
    getBookedEventRepo(bookingId: string): Promise<{ singleEvent: any }>
    checkSeatAvailable(product: PaymentData): Promise<{ success: boolean, message: string, data?: any | undefined | null }>
    updateBookingData(product: PaymentData): Promise<{ success: boolean, message: string }>
    checkRetrySeatAvailable(product: retryPayment): Promise<{ success: boolean, message: string, data?: any | undefined | null }>
    getCategoryBasedRepo(postId: string): Promise<{ success: boolean, message: string, category: any }>
    saveBillingDetailsRepo(formData: billingData): Promise<{ success: boolean, message: string, data: any }>
    saveRetryBillingRepo(formData: retryBillingData): Promise<{ success: boolean, message: string, data: any }>
    updatePaymentStatusRepo(bookedId: string): Promise<{ success: boolean, message: string } | undefined>
    checkUserBookingValidRepo(email: string, eventName: string, bookedId: string): Promise<{ success: boolean, message: string }>


}