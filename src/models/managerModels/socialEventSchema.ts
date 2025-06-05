import mongoose from "mongoose";

const socialEventSchema = new mongoose.Schema(
    {
      Manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true,
      },
      adminOffer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"offerSchema",
      },
      managerOffer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"managerOfferSchema"
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
      address:{
        type:String,
      
      },
      location: {
          type:{type: String ,enum:["Point"]},
          coordinates:{type:[Number]}//ivide latitude,longitude kittum
        },
      startDate: {
        type: Date,
        required: true,
      },
      endDate:{
        type:Date,
        required:true
      },
      amount:{
        type:Number,

      },
      typesOfTickets:[
        {
        type: { type: String },
        noOfSeats:Number,
        Amount:Number,
        Included:[String],
        notIncluded:[String],
        offerDetails: {
          offerPercentage: { type: Number },
          deductionAmount: { type: Number },
          offerAmount: { type: Number },
          isOfferAdded: {
            type: String,
            enum: ["Offer Added", "Not Added"],
            default: "Not Added",
          },
        },

        }
      ],
      noOfDays:{
        type:Number,
        required:true
      },

  
      destination:{
        type:String,
      },
      time: { 
        type: String,
      },
      images: {
            type: Array,
            required:true     
    },
    
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
   
 
  
    },

    {
      timestamps: true,
    }
  );
  socialEventSchema.index({location:"2dsphere"});//Geospatial index create cheythu
export default mongoose.model('SocialEvent', socialEventSchema);
