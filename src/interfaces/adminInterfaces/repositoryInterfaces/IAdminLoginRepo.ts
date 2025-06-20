import { FormData } from "../../../dtos/user.dto";

export interface IAdminLoginRepo {
    postAdminData(formData: FormData, password: string): Promise<{ success: boolean; message: string; user: any }>;
    checkAdminLogin(formData: { [key: string]: string }): Promise<{ success: boolean; message: string; user: any }>;
    getUserDetailsRepository(): Promise<{ success: boolean; message: string; user: any }>;
    getManagerDetailsRepository(): Promise<{ success: boolean, message: string, user: any }>
    getManagerAndBookedRepository(managerId: string): Promise<{ success: boolean, message: string, user: any }>
    postToggleIsBlockRepository(userId: string, updatedStatus: boolean): Promise<{ success: boolean, message: string, user: any }>
    postManagerIsBlockRepository(managerId: string, updatedStatus: boolean): Promise<{ success: boolean, message: string, user: any }>
    fetchAdminWalletRepository(): Promise<{ success: boolean, message: string, user: any }>
    getManagerUserCountRepository(): Promise<{ success: boolean, message: string, user: any }>
    fetchDashboardGraphRepo(selectedType: string, selectedTime: string): Promise<{ success: boolean, message: string, user: any }>
    fetchDashboardPieChartRepo(): Promise<{ success: boolean, message: string, data: any }>
    fetchDashboardBarChartRepo(selectedEvent: string): Promise<{ success: boolean, message: string, data: any }>
    postCategoryIsBlockRepository(categoryId:string,updatedStatus:boolean):Promise<{success:boolean,message:string,user:any}>


}