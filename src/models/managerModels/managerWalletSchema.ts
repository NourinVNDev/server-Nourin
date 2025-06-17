    import mongoose ,{Schema} from "mongoose";
import { eventNames } from "process";
import { IManagerWallet } from "../../dtos/user.dto";
    const ManagerWalletSchema = new mongoose.Schema({
        managerId: {
            type: Schema.Types.ObjectId,
            ref: "Manager", 
            required: true, 
            unique: true },
        balance: {
            type: Number, 
            default: 0 },
    
        currency: { 
            type: String,
            default: "INR" },
        transactions: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            managerAmount: { type: Number, required: true },
            type: { type: String, enum: ["credit", "debit", "transfer"], required: true },
            status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
            createdAt: { type: Date, default: Date.now },
            eventName:{type:String},
            bookedId:{type:String},
            noOfPerson:{type:Number}
        },
        ],
    });
    
    export default mongoose.model("ManagerWallet", ManagerWalletSchema);
    