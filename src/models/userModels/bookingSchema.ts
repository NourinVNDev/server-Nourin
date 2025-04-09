import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
    bookingId:{
        type:String,
        unique:true

    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialEvent',
        required: true  
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed'],
        default: 'Confirmed'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys', 
        required: true
    },
    bookingDate: {
        type: Date,
      
    },
    totalAmount: {
        type: Number,
   
    },
    ticketDetails:{
        type: { type: String },
        Included:[String],
        notIncluded:[String],
    },
    billingDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNo: { type: String, required: true },
        address: { type: String, required: true }
    },
    NoOfPerson: {
        type: Number,
     
    },
    bookedUser: [{
        user: {
            type: String,
            required: true
        },
        isParticipated: {
            type: Boolean,
            default: false
        }
    }]

});

export default mongoose.model('BookedUser', bookingSchema);
