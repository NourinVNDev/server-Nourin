import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
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
    lowercase: true,

  },
  password: {
    type: String,
  
    minlength: 6, 
  },
  phoneNo: {
    type: Number,

    match: [
      /^\d{10}$/, 
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
  location:{
    type:{type:String,enum:['Point']},
    coordinates:{type:[Number]}
  },
  profilePhoto:{
    type:String,
  }

}, {
  timestamps: true,
});
userSchema.index({location:'2dsphere'});
export default mongoose.model('User', userSchema);
