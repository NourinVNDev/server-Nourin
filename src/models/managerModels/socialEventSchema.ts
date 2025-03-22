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
      address:{
        type:String,
        required:true
      },
      location: {
          type:{type: String, required: true ,enum:["Point"]},
          coordinates:{type:[Number],required:true}//ivide latitude,longitude kittum
        },
      startDate: {
        type: Date,
        required: true,
      },
      endDate:{
        type:Date,
        required:true
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
      noOfPerson:{
        type:Number,
        required:true
      },
      noOfDays:{
        type:Number,
        required:true
      },

  
      destination:{
        type:String,
        required:true
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
