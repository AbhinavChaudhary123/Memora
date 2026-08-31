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

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "https://memora-1-afuw.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, server-to-server, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

/* =========================
   Middleware
========================= */

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/* =========================
   Health Check
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "MEMORA",
    message: "API is running",
  });
});

/* =========================
   Routes
========================= */

app.use("/api/auth", auth);
app.use("/api/stories", stories);
app.use("/api/places", places);
app.use("/api/users", users);

/* =========================
   Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Something went wrong",
  });
});

/* =========================
   Database + Server
========================= */

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`MEMORA API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });