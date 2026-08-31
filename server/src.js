import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import auth from "./routes/auth.js";
import stories from "./routes/stories.js";
import places from "./routes/places.js";
import users from "./routes/users.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, name: "RETRO-HEADS" }),
);
app.use("/api/auth", auth);
app.use("/api/stories", stories);
app.use("/api/places", places);
app.use("/api/users", users);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`RETRO-HEADS API on ${port}`)))
  .catch((e) => {
    console.error("MongoDB connection failed", e);
    process.exit(1);
  });
