import express from "express";
import User from "../models/User.js";
import Story from "../models/Story.js";
import Place from "../models/Place.js";
import { protect } from "../middleware/auth.js";
const r = express.Router();
r.get("/me", protect, async (req, res) => {
  const [stories, places] = await Promise.all([
    Story.find({ author: req.user._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 }),
    Place.find({ author: req.user._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 }),
  ]);
  res.json({ user: req.user, stories, places });
});
r.patch("/me", protect, async (req, res) => {
  const u = await User.findByIdAndUpdate(
    req.user._id,
    {
      bio: req.body.bio,
      favoriteEra: req.body.favoriteEra,
      avatar: req.body.avatar,
    },
    { new: true },
  ).select("-password");
  res.json(u);
});
r.get("/:username", async (req, res) => {
  const u = await User.findOne({ username: req.params.username }).select(
    "username bio avatar favoriteEra createdAt",
  );
  if (!u) return res.status(404).json({ message: "User not found" });
  const [stories, places] = await Promise.all([
    Story.find({ author: u._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 }),
    Place.find({ author: u._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 }),
  ]);
  res.json({ user: u, stories, places });
});
export default r;
