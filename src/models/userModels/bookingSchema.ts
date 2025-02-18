import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
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
    paymentStatus: { // Fixed typo
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed'],
        default: 'Confirmed'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys', // Ensure this is the correct reference
        required: true
    },
    bookingDate: {
        type: Date,
      
    },
    totalAmount: {
        type: Number,
   
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
     
    }
});

export default mongoose.model('BookedUser', bookingSchema);
