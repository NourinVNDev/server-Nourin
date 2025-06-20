import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialEvent', required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      reviewText: { type: String, required: true },
      AverageRating: { type: Number, min: 1, max: 5 }
    },
    { timestamps: true }
  );
  
export default mongoose.model("review", reviewSchema)