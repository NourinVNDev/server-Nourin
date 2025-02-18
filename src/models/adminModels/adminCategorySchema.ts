import mongoose from "mongoose";
import { Schema } from "mongoose";
const CategorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        unique:true,
        required:true
    },
    Events:[{
        type:Schema.Types.ObjectId,
        ref:'SocialEvent',
    }],
    isListed:{
        type:Boolean,
        default:true
    },
    Description:{
        type:String,
        required:true
    }
})

export default mongoose.model('categorys',CategorySchema);
