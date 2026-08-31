import express from "express";
import Story from "../models/Story.js";
import Comment from "../models/Comment.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();

/* =========================================
   GET ALL STORIES
   GET /api/stories?q=
========================================= */

r.get("/", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching stories:", error);

    res.status(500).json({
      message: "Failed to load stories",
    });
  }
});

/* =========================================
   GET SINGLE STORY
   GET /api/stories/:id
========================================= */

r.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "author",
      "username avatar",
    );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);

    res.status(500).json({
      message: "Failed to load story",
    });
  }
});

/* =========================================
   CREATE STORY
   POST /api/stories
========================================= */

r.post("/", protect, async (req, res) => {
  try {
    const s = await Story.create({
      ...req.body,
      author: req.user._id,
    });

    res.status(201).json(
      await s.populate("author", "username avatar"),
    );
  } catch (error) {
    console.error("Error creating story:", error);

    res.status(500).json({
      message: "Failed to create story",
    });
  }
});

/* =========================================
   UPDATE STORY
   PATCH /api/stories/:id
========================================= */

r.patch("/:id", protect, async (req, res) => {
  try {
    const s = await Story.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("author", "username avatar");

    if (!s) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.json(s);
  } catch (error) {
    console.error("Error updating story:", error);

    res.status(500).json({
      message: "Failed to update story",
    });
  }
});

/* =========================================
   DELETE STORY
   DELETE /api/stories/:id
========================================= */

r.delete("/:id", protect, async (req, res) => {
  try {
    const s = await Story.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!s) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    await Comment.deleteMany({
      story: s._id,
    });

    res.json({
      message: "Story deleted",
    });
  } catch (error) {
    console.error("Error deleting story:", error);

    res.status(500).json({
      message: "Failed to delete story",
    });
  }
});

/* =========================================
   LIKE / UNLIKE STORY
   POST /api/stories/:id/like
========================================= */

r.post("/:id/like", protect, async (req, res) => {
  try {
    const s = await Story.findById(req.params.id);

    if (!s) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    const i = s.likes.findIndex((x) =>
      x.equals(req.user._id),
    );

    if (i < 0) {
      s.likes.push(req.user._id);
    } else {
      s.likes.splice(i, 1);
    }

    await s.save();

    res.json({
      likes: s.likes.length,
      liked: i < 0,
    });
  } catch (error) {
    console.error("Error liking story:", error);

    res.status(500).json({
      message: "Failed to like story",
    });
  }
});

/* =========================================
   BOOKMARK / REMOVE BOOKMARK
   POST /api/stories/:id/bookmark
========================================= */

r.post("/:id/bookmark", protect, async (req, res) => {
  try {
    const s = await Story.findById(req.params.id);

    if (!s) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    const i = s.bookmarks.findIndex((x) =>
      x.equals(req.user._id),
    );

    if (i < 0) {
      s.bookmarks.push(req.user._id);
    } else {
      s.bookmarks.splice(i, 1);
    }

    await s.save();

    res.json({
      bookmarked: i < 0,
    });
  } catch (error) {
    console.error("Error bookmarking story:", error);

    res.status(500).json({
      message: "Failed to bookmark story",
    });
  }
});

/* =========================================
   GET COMMENTS
   GET /api/stories/:id/comments
========================================= */

r.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({
      story: req.params.id,
    })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);

    res.status(500).json({
      message: "Failed to load comments",
    });
  }
});

/* =========================================
   ADD COMMENT
   POST /api/stories/:id/comments
========================================= */

r.post("/:id/comments", protect, async (req, res) => {
  try {
    const c = await Comment.create({
      story: req.params.id,
      author: req.user._id,
      text: req.body.text,
    });

    res.status(201).json(
      await c.populate("author", "username avatar"),
    );
  } catch (error) {
    console.error("Error adding comment:", error);

    res.status(500).json({
      message: "Failed to add comment",
    });
  }
});

export default r;