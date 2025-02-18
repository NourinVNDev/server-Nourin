import mongoose, { Schema } from "mongoose";

const messageSchema=new Schema({
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Conversation',
        required:true

    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Manager',
        required:true
    },
    message:{
        type:String,
        required:true
    },

    
},
{timestamps:true})

export default mongoose.model('Message',messageSchema);