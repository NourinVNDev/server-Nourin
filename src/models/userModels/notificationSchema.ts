import mongoose,{Schema} from "mongoose";
const notificationSchema=new mongoose.Schema(
    {
        heading:{type:String,required:true},
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        from:{type:Schema.Types.ObjectId,refPath:"fromModel"},
        fromModal:{type:String,enum:['User','Manager','Admin','Verifier','bookedUser']},
        to:{type:Schema.Types.ObjectId,refPath:'toModal'},
        toModal:{type:String,enum:['bookedUser','Manager','Admin','Verifier','User']}

    },{timestamps:true}
)
export default mongoose.model('NotificationSchema',notificationSchema);