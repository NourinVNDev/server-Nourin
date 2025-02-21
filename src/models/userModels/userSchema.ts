import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true, // Removes extra whitespace
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Converts email to lowercase

  },
  password: {
    type: String,
  
    minlength: 6, // Ensures password has at least 6 characters
  },
  phoneNo: {
    type: String,

    unique: true,
    match: [
      /^\d{10}$/, // Validates a 10-digit phone number
      "Please enter a valid 10-digit phone number",
    ],
  },
  isBlock:{
    type:Boolean,
    default:false
  },
  address:{
    type:String,
    
  },
  profilePhoto:{
    type:String,
  }

}, {
  timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
});

export default mongoose.model('User', userSchema);
