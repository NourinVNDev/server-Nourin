import { IVerifierDetailsRepo } from "../../interfaces/managerInterfaces/repositoryInterfaces/IVerifierDetailsRepo";
import VERIFIERDB from "../../models/verifierModels/verifierSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import SOCIALEVENTDB from "../../models/managerModels/socialEventSchema";
import { verifierFormData } from "../../dtos/user.dto";
export class VerifierDetailsRepository implements IVerifierDetailsRepo {
    async getAllVerifierRepo(managerName: string) {
        try {
            console.log("thank", managerName);

            const result = await VERIFIERDB.find({ companyName: managerName });
            const manager = await MANAGERDB.findOne({ firmName: managerName });
            const eventIDs = result.flatMap(verifier => verifier.Events);
            const socialEvents = await SOCIALEVENTDB.find({ _id: { $in: eventIDs } }, { eventName: 1, _id: 0 });

            console.log("Verifier data from Repository", result);

            if (!manager) {
                return { success: false, message: "Manager not found", data: { result, companyName: null } };
            }

            return {
                success: true,
                message: "Verifier Data retrieved successfully",
                data: { result, companyName: manager.firmName, socialEvents }
            };
        } catch (error) {
            console.error("Error in getAllVerifierRepository:", error);
            return { success: false, message: `Internal server error: ${error}` };
        }

    }
    async updateVerifierStatusRepo(verifierId: string) {
        try {
            const result = await VERIFIERDB.findById({ _id: verifierId });
            if (!result) {
                return { success: false, message: "Verifier not found" };
            }


            result.isActive = !result.isActive;


            await result.save();

            console.log("Updated Verifier status from Repository", result);
            return { success: true, message: "Verifier status updated successfully", data: result };
        }
        catch (error) {
            console.error("Error in updateVerifierStatusRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async postVerifierLoginRepo(formData: verifierFormData) {
        const validEvents = formData.Events.filter(event => event.trim() !== "");
        console.log("ValidEvents", validEvents);

        const socialEvents = await SOCIALEVENTDB.find({ eventName: { $in: validEvents } });
        console.log("Social Events:", socialEvents);

        if (!socialEvents.length) {
            return { success: false, message: 'No matching events found', data: null };
        }


        const eventIds = socialEvents.map(event => event._id.toString());
        console.log("Event IDs:", eventIds);
        console.log("Last", formData);

        const newVerifier = new VERIFIERDB({
            verifierName: formData.verifierName,
            email: formData.email,
            Events: eventIds,
            companyName: formData.companyName,
            isActive: true

        });

        try {
            console.log('Saving new verifier123:', newVerifier);
            const savedVerifier = await newVerifier.save();
            console.log('Verifier saved:', savedVerifier);

            const manager = await MANAGERDB.findOne({ firmName: savedVerifier.companyName });
            if (manager && savedVerifier) {
                manager.verifier.push(savedVerifier._id.toString());
                await manager.save();
            }

            return { success: true, message: "Manager will verify your request later", data: savedVerifier };
        } catch (error) {

            console.error('Error while saving new verifier:', error);
            return { success: false, message: 'Failed to save verifier', data: null };
        }
    }
    async fetchSelectedVerifierRepo(verifierId: string) {
        try {
            const result = await VERIFIERDB.findById(verifierId);
            const socialEvent = await SOCIALEVENTDB.find({ _id: result?.Events.map((event: any) => event) });
            if (result && socialEvent) {


                const eventNames = socialEvent.map((event: any) => event.eventName);

                console.log("EventNames", eventNames, "result", result);

                console.log("Fetching Verifier from Repository", { result: result, eventNames: eventNames });
                return { success: true, message: "fetch Verifier Data successfully", data: result, eventNames: eventNames };
            } else {
                return { success: false, message: "Verifier not found" };
            }
        } catch (error) {
            console.error("Error in fetchVerifierRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }
    async updateVerifierRepo(formData: verifierFormData) {
        console.log("Updated", formData);

        try {
            if (!Array.isArray(formData.Events)) {
                return {
                    success: false,
                    message: "Invalid or missing 'events' in formData.",
                };
            }

            const validEvents = formData.Events.filter(event => event.trim() !== "");
            const socialEvents = await SOCIALEVENTDB.find({ eventName: { $in: validEvents } });

            if (socialEvents.length === 0) {
                return { success: false, message: 'No matching events found', data: null };
            }

            const eventIds = socialEvents.map(event => event._id.toString());

            const verifierData = await VERIFIERDB.findById(formData._id);
            if (!verifierData) {
                return {
                    success: false,
                    message: `Verifier with name '${formData.verifierName}' not found.`,
                };
            }

            const updatedVerifier = await VERIFIERDB.findOneAndUpdate(
                { _id: formData._id },
                {
                    $set: {
                        verifierName: formData.verifierName,
                        email: formData.email,
                        Events: eventIds,
                        companyName: formData.companyName
                    }
                },
                { new: true }
            );

            if (!updatedVerifier) {
                return {
                    success: false,
                    message: "Failed to update verifier.",
                };
            }

            const verifiers = await VERIFIERDB.find({ companyName: formData.companyName });

            return {
                success: true,
                message: "Verifier updated successfully.",
                data: verifiers,
            };

        } catch (error) {
            console.error("Error in updateVerifierRepository:", error);
            return { success: false, message: "Internal server error" };
        }
    }


}