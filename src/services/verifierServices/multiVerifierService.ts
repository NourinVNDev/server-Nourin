import { IMultiVerifierService } from "../../interfaces/verifierInterfaces/serviceInterfaces/IMultiVerifierService";
import { injectable, inject } from "inversify";
import TYPES from "../../inversify/types";
import { privateDecrypt } from "crypto";
import { IMultiVerifierRepo } from "../../interfaces/verifierInterfaces/repositoryInterfaces/IMultiVerifierRepo";
import { verifierFormData } from "../../dtos/user.dto";
@injectable()
export class MultiVerifierService implements IMultiVerifierService {
    constructor(
        @inject(TYPES.IMultiVerifierRepo) private _verifierRepo: IMultiVerifierRepo
    ) { }
    async checkIfVerifierActive(email: string) {



        const managerData = await this._verifierRepo.checkTheVerifierIsActive(email);

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
    async verifierLoginDetails(formData: verifierFormData) {

        const managerData = await this._verifierRepo.saveVerifierDetailsRepo(formData);

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
    async fetchAllEvents(email: string) {
        const managerData = await this._verifierRepo.fetchAllCompanyEventRepo(email);

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
    async fetchAllBookingDetails(eventId: string) {
        const bookedDetails = await this._verifierRepo.fetchAllBookingDetailsRepo(eventId);

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
    async fetchSingleUserDetails(bookedId: string, userName: string) {
        const bookedDetails = await this._verifierRepo.fetchSingleUserDetailsRepo(bookedId, userName);

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
    async markUserEntryService(bookedId: string, userName: string) {
        const BookedData = await this._verifierRepo.markUserEntryRepo(bookedId, userName);
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