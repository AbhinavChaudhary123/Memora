import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, default: "Collecting little pieces of yesterday." },
    avatar: { type: String, default: "" },
    favoriteEra: { type: String, default: "The good old days" },
  },
  { timestamps: true },
);
export default mongoose.model("User", schema);
