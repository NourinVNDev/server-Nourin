import mongoose from "mongoose";

const offerSchema=new mongoose.Schema({
        offerName:{
            required:true,
            type:String,
        },
        discount_on:{
            type:String,
            required:true,
        },
        discount_value:{
            type:String,
            required:true,
        },
        startDate:{
            type:Date,
            required:true
        },
        endDate:{
            type:Date,
            required:true
        },
        item_description:{
            type:String,
            required:true
        }
})
export default mongoose.model('EventOffer',offerSchema);
