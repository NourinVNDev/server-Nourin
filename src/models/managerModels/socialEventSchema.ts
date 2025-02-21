import mongoose from "mongoose";

const socialEventSchema = new mongoose.Schema(
    {
      Manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true,
      },
      offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"EventOffer",
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      eventName:{
        type:String,
        required:true,
      
      },
      companyName:{
        type:String,
        required:true
      },
      content: {
        type: String,
        trim: true,
      },
      location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate:{
        type:Date,
        required:true
      },
      noOfPerson:{
        type:Number,
        required:true
      },
      noOfDays:{
        type:Number,
        required:true
      },

      Amount:{
        type:Number,
        required:true
      },
      destination:{
        type:String,
        required:true
      },
      Included:[String],
      notIncluded:[String],
      time: {
        type: String,
      },
      images: {
            type: Array,
            required:true     
    },
      tags: [String],
      likes: [
        {
          user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          },
          createdAt: { type: Date, default: Date.now }
        },
      ],
      comments: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          content: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      offerDetails:{
        offerPercentage:{type:Number},
        deductionAmount:{type:Number},
        offerAmount:{type:Number},
        isOfferAdded:{type:String,enum:['Offer Added','Not Added'],default:'Not Added'}
      },
  
    },

    {
      timestamps: true,
    }
  );
export default mongoose.model('SocialEvent', socialEventSchema);
