import mongoose,{Schema} from "mongoose";
const notificationSchema=new mongoose.Schema(
    {
        heading:{type:String,required:true},
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        from:{type:Schema.Types.ObjectId,refPath:"fromModel",required:true},
        fromModal:{type:String,required:true,enum:['User','Manager','Admin','Verifier']},
        to:{type:Schema.Types.ObjectId,refPath:'toModal'},
        toModal:{type:String,enum:['bookedUser','Manager','Admin','Verifier']}

    },{timestamps:true}
)
export default mongoose.model('NotificationSchema',notificationSchema);