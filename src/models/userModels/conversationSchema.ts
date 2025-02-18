import mongoose, { mongo } from "mongoose";

const conversationSchema=new mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Manager'
        }

    
    ],
    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Message',
            default:[]
        }
    ],

},{timestamps:true});

export default mongoose.model('Conversation',conversationSchema);