import { FormData } from "../../../dtos/user.dto";

export interface IAdminLoginService {
    AdminloginDetails(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    Adminlogin(formData: FormData): Promise<{ success: boolean; message: string; user: any | null }>;
    getUserDetailsService(): Promise<{ success: boolean; message: string; user: any | null }>;
    getManagerDetailsService: () => Promise<| { success: boolean; message: string; user: any; } | undefined>;
    getManagerEventService(managerId: string): Promise<| { success: boolean; message: string; user: any; } | undefined>;
    postToggleIsBlockService(userId: string, updatedStatus: boolean): Promise<{ result?: any }>
    postManagerIsBlockService(managerId: string, updatedStatus: boolean): Promise<{ result?: any }>
    fetchAdminWalletService(): Promise<{ result?: any }>
    getUserManagerDetailsService(): Promise<{ success: boolean; message: string; user: any }>
    getDashboardGraph(selectedType: string, selectedTime: string): Promise<{ success: boolean; message: string; user: any }>
    getDashboardPieChart(): Promise<{ success: boolean; message: string; data: any }>
    getDashboardBarChart(selectedEvent: string): Promise<{ success: boolean; message: string; data: any }>
      postCategoryIsBlockService(categoryId:string,updatedStatus:boolean):Promise<{result?:any}>
}