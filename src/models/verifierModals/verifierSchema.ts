import mongoose,{Schema} from "mongoose";
const verifierSChema=new Schema({
    verifierName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
    companyName:{
        type:String
    },
    status:{
        type:String,
        enum:['pending','confirmed'],
        default:'pending'
    }
})
export default mongoose.model('Verifier',verifierSChema);