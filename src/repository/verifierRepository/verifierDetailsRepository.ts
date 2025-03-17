import { IVerifierRepo } from "./IVerifierRepo";
import SOCIALEVENTSDB from "../../models/managerModels/socialEventSchema";
import MANAGERDB from "../../models/managerModels/managerSchema";
import VERIFIERDB from "../../models/verifierModals/verifierSchema";
import { verifierFormData } from "../../config/enum/dto";
import bcrypt  from 'bcrypt';
import BOOKINGDB from "../../models/userModels/bookingSchema";
import mongoose from "mongoose";
const hashPassword = async (password:string) => {
  try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10); // 10 is the salt rounds
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);
      
      console.log('Hashed Password:', hashedPassword);
      return hashedPassword;
  } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
  }
};
export class verifierDetailsRepository implements IVerifierRepo{
    async checkTheManagerIsActive(email:string){
        const  manager=await MANAGERDB.findOne({email:email});
        if(!manager){
            return {success:false,message:'Manager has not found',data:null}
        }

        const socialEvents=await SOCIALEVENTSDB.find({Manager:manager?._id});

        if(!socialEvents){
            return {success:false,message:'Social Events has not found',data:null}

        }
        return{success:true,message:"Manager is Active",data:socialEvents}
    }
    async saveVerifierDetailsRepo(formData: verifierFormData) {
        const verifier = await VERIFIERDB.findOne({ email: formData.email });
    
        if (verifier?.status && verifier.status !== 'pending') {
            return { success: true, message: 'Manager has already accepted your request', data: null };
        } else {
            const hashedPassword = await hashPassword(formData.password);
            const newVerifier = new VERIFIERDB({
                verifierName: formData.name,
                email: formData.email,
                password: hashedPassword,
                companyName: formData.companyName,
                status: 'pending'
            });
    
            try {
             
                console.log('Saving new verifier:', newVerifier);
                const savedVerifier = await newVerifier.save();
                console.log('Verifier saved:', savedVerifier);
                const MANAGER=await MANAGERDB.findOne({firmName:savedVerifier.companyName});
                if(MANAGER){
                    MANAGER?.verifier.push(savedVerifier._id.toString());
                    await MANAGER?.save();
                }


                return { success: true, message: "Manager will verify your request later", data: savedVerifier };
            } catch (error) {
                // Log any errors that occur during the save
                console.error('Error while saving new verifier:', error);
                return { success: false, message: 'Failed to save verifier', data: null };
            }
        }
    }

    async fetchAllCompanyEventRepo(companyName:string){
        const  eventDetails=await SOCIALEVENTSDB.find({companyName:companyName});
        if(!eventDetails){
            return {success:false,message:'No Events hosted  in this company',data:null}
        }
        return{success:true,message:"Events are hosted",data:eventDetails}
    }

    async fetchAllBookingDetailsRepo(eventId:string){
        const  eventDetails=await BOOKINGDB.find({eventId:eventId});
        if(!eventDetails){
            return {success:false,message:'No Booked user is in events',data:null}
        }
        return{success:true,message:"Booked User Presented",data:eventDetails}
    }

    async markUserEntryRepo(bookedId:string){
      
        const  eventDetails=await BOOKINGDB.findOne({bookingId:bookedId});
        if(!eventDetails){
            return {success:false,message:'No Booked user is in events',data:null}
        }
        eventDetails.isParticipated=!eventDetails.isParticipated
        await eventDetails.save();
        if(eventDetails.isParticipated===true){
            return{success:true,message:"Mark the attendence",data:eventDetails}
        }else{
            return{success:true,message:"Mark to remove teh attendence",data:eventDetails} 
        }

    }
    
    
    

}
