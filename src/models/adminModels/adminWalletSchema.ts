import mongoose,{Schema} from "mongoose";
 const AdminWalletSchema = new mongoose.Schema({
    adminId:{
    type: Schema.Types.ObjectId,
    ref: "Admin", 
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
        totalAmount:{type:Number,required:true},
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        managerAmount: { type: Number, required: true },
        adminAmount:{type:Number},
        type: { type: String, enum: ["credit", "debit", "transfer"], required: true },
        status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
        createdAt: { type: Date, default: Date.now },
        eventName:{type:String},
        bookedId:{type:String},
        noOfPerson:{type:Number},
        companyName:{type:String}
      },
    ],
  });
  
  export default mongoose.model("AdminWallet", AdminWalletSchema);
  