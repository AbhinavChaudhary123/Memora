import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    placeName: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    description: { type: String, required: true, maxlength: 2500 },
    bestTimeToVisit: { type: String, default: "" },
    memory: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true },
);
export default mongoose.model("Place", schema);
