import { verifierFormData } from "../../config/enum/dto";
import { IVerifierRepo } from "../../repository/verifierRepository/IVerifierRepo";
import { verifierDetailsRepository } from "../../repository/verifierRepository/verifierDetailsRepository";
import { IVerifierService } from "./IVerifierService";
export class verifierDetailsService implements IVerifierService{
    private verifierService:IVerifierRepo;
    constructor(verifierRepositoryInstance:verifierDetailsRepository){
        this.verifierService=verifierRepositoryInstance;

    }

    async checkIfManagerActive(email: string) {


    
        const managerData = await this.verifierService.checkTheManagerIsActive(email); 

        if (managerData.success) {
            return {
                success: managerData.success,
                message: managerData.message,
                data: managerData.data
            };
        } else {
            return {
                success: false,
                message: managerData.message,
                data: managerData.data
            };
        }
    }
    async verifierLoginDetails(formData:verifierFormData){

        const managerData = await this.verifierService.saveVerifierDetailsRepo(formData); 

        if (managerData.success) {
            return {
                success: managerData.success,
                message: managerData.message,
                data: managerData.data
            };
        } else {
            return {
                success: false,
                message: managerData.message,
                data: managerData.data
            };
        }
    }
    async fetchAllEvents(companyName:string){
        const managerData = await this.verifierService.fetchAllCompanyEventRepo(companyName); 

        if (managerData.success) {
            return {
                success: managerData.success,
                message: managerData.message,
                data: managerData.data
            };
        } else {
            return {
                success: false,
                message: managerData.message,
                data: managerData.data
            };
        }
    }

    async fetchAllBookingDetails(eventId:string){
        const bookedDetails = await this.verifierService.fetchAllBookingDetailsRepo(eventId); 

        if (bookedDetails.success) {
            return {
                success: bookedDetails.success,
                message: bookedDetails.message,
                data: bookedDetails.data
            };
        } else {
            return {
                success: false,
                message: bookedDetails.message,
                data: bookedDetails.data
            };
        }
    }
    async markUserEntryService(bookedId:string){
        const BookedData = await this.verifierService.markUserEntryRepo(bookedId); 
        if (BookedData.success) {
            return {
                success: BookedData.success,
                message: BookedData.message,
                data: BookedData.data
            };
        } else {
            return {
                success: false,
                message: BookedData.message,
                data: BookedData.data
            };
        }

    }

}