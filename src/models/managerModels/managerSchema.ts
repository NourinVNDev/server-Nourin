import mongoose, { Schema } from "mongoose";

const ManagerSchema = new Schema({
  firmName: {
    type: String,
    required: true,
    trim: true, // Removes extra whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Converts email to lowercase

  },
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Ensures password has at least 6 characters
  },
  phoneNo: {
    type: String,
    required: true,
    match: [
      /^\d{10}$/, // Validates a 10-digit phone number
      "Please enter a valid 10-digit phone number",
    ],
  },
    isBlock:{
      type:Boolean,
      default:false


    
  }
}, {
  timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
});

export default mongoose.model('Manager', ManagerSchema);
