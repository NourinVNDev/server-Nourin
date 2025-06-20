import mongoose,{Schema} from "mongoose";
const verifierSChema=new Schema({
    verifierName:{
        type:String,
        
    },
    email:{
        type:String,
      
    },
  Events:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'SocialEvent'
}],
    companyName:{
        type:String
    },
    isActive:{
        type:Boolean
 
    }
})
export default mongoose.model('Verifier',verifierSChema);