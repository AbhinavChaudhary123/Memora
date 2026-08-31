import express from "express";
import Story from "../models/Story.js";
import Comment from "../models/Comment.js";
import { protect } from "../middleware/auth.js";
const r = express.Router();
r.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q
    ? {
        $or: [
          { title: new RegExp(q, "i") },
          { story: new RegExp(q, "i") },
          { tags: new RegExp(q, "i") },
          { location: new RegExp(q, "i") },
        ],
      }
    : {};
  const data = await Story.find(filter)
    .populate("author", "username avatar")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(data);
});
r.post("/", protect, async (req, res) => {
  const s = await Story.create({ ...req.body, author: req.user._id });
  res.status(201).json(await s.populate("author", "username avatar"));
});
r.patch("/:id", protect, async (req, res) => {
  const s = await Story.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    req.body,
    { new: true, runValidators: true },
  ).populate("author", "username avatar");
  if (!s) return res.status(404).json({ message: "Story not found" });
  res.json(s);
});
r.delete("/:id", protect, async (req, res) => {
  const s = await Story.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });
  if (!s) return res.status(404).json({ message: "Story not found" });
  await Comment.deleteMany({ story: s._id });
  res.json({ message: "Story deleted" });
});
r.post("/:id/like", protect, async (req, res) => {
  const s = await Story.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Story not found" });
  const i = s.likes.findIndex((x) => x.equals(req.user._id));
  i < 0 ? s.likes.push(req.user._id) : s.likes.splice(i, 1);
  await s.save();
  res.json({ likes: s.likes.length, liked: i < 0 });
});
r.post("/:id/bookmark", protect, async (req, res) => {
  const s = await Story.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Story not found" });
  const i = s.bookmarks.findIndex((x) => x.equals(req.user._id));
  i < 0 ? s.bookmarks.push(req.user._id) : s.bookmarks.splice(i, 1);
  await s.save();
  res.json({ bookmarked: i < 0 });
});
r.get("/:id/comments", async (req, res) =>
  res.json(
    await Comment.find({ story: req.params.id })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 }),
  ),
);
r.post("/:id/comments", protect, async (req, res) => {
  const c = await Comment.create({
    story: req.params.id,
    author: req.user._id,
    text: req.body.text,
  });
  res.status(201).json(await c.populate("author", "username avatar"));
});
export default r;
