import mongoose,{Schema} from "mongoose";
const UserWalletSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    balance:{
        type:Number,
        default:0
    },
    currency:{
        type:String,
        default:'USD'
    },
 
    transactionHistory:[{
        transaction:{type:String,enum:["Money Added","Money Deduct"]},
        amount:{type:Number},
        bookingID:{type:String},
        bookingDate:{type:String},
}],
},{timestamps:true})

export default mongoose.model('UserWallet',UserWalletSchema);