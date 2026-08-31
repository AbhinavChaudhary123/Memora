import express from "express";
import Place from "../models/Place.js";
import { protect } from "../middleware/auth.js";
const r = express.Router();
r.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const f = q
    ? {
        $or: [
          { placeName: new RegExp(q, "i") },
          { city: new RegExp(q, "i") },
          { state: new RegExp(q, "i") },
          { description: new RegExp(q, "i") },
        ],
      }
    : {};
  res.json(
    await Place.find(f)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .limit(50),
  );
});
r.post("/", protect, async (req, res) =>
  res
    .status(201)
    .json(
      await (
        await Place.create({ ...req.body, author: req.user._id })
      ).populate("author", "username avatar"),
    ),
);
r.patch("/:id", protect, async (req, res) => {
  const p = await Place.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    req.body,
    { new: true },
  ).populate("author", "username avatar");
  if (!p) return res.status(404).json({ message: "Place not found" });
  res.json(p);
});
r.delete("/:id", protect, async (req, res) => {
  const p = await Place.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });
  if (!p) return res.status(404).json({ message: "Place not found" });
  res.json({ message: "Place deleted" });
});
export default r;
