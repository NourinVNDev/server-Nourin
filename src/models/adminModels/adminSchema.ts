import mongoose,{mongo, Schema} from "mongoose";


const AdminSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
  
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    }},{
    
        timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
      
})
export default mongoose.model('Admin',AdminSchema);