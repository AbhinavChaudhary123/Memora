import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    story: { type: String, required: true, maxlength: 5000 },
    cover: { type: String, default: "" },
    mood: { type: String, default: "nostalgic" },
    tags: [{ type: String, trim: true }],
    location: { type: String, default: "" },
    year: { type: Number },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);
export default mongoose.model("Story", schema);
