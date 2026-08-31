import express from "express";
import Place from "../models/Place.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();

/* =========================================
   GET ALL PLACES
   GET /api/places?q=
========================================= */

r.get("/", async (req, res) => {
  try {
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

    const places = await Place.find(f)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);

    res.status(500).json({
      message: "Failed to load places",
    });
  }
});

/* =========================================
   GET SINGLE PLACE
   GET /api/places/:id
========================================= */

r.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("author", "username avatar");

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json(place);
  } catch (error) {
    console.error("Error fetching place:", error);

    res.status(500).json({
      message: "Failed to load place",
    });
  }
});

/* =========================================
   CREATE PLACE
   POST /api/places
========================================= */

r.post("/", protect, async (req, res) => {
  try {
    const place = await Place.create({
      ...req.body,
      author: req.user._id,
    });

    await place.populate("author", "username avatar");

    res.status(201).json(place);
  } catch (error) {
    console.error("Error creating place:", error);

    res.status(500).json({
      message: "Failed to create place",
    });
  }
});

/* =========================================
   UPDATE PLACE
   PATCH /api/places/:id
========================================= */

r.patch("/:id", protect, async (req, res) => {
  try {
    const p = await Place.findOneAndUpdate(
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

    if (!p) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json(p);
  } catch (error) {
    console.error("Error updating place:", error);

    res.status(500).json({
      message: "Failed to update place",
    });
  }
});

/* =========================================
   DELETE PLACE
   DELETE /api/places/:id
========================================= */

r.delete("/:id", protect, async (req, res) => {
  try {
    const p = await Place.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!p) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json({
      message: "Place deleted",
    });
  } catch (error) {
    console.error("Error deleting place:", error);

    res.status(500).json({
      message: "Failed to delete place",
    });
  }
});

export default r;