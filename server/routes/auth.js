import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const r = express.Router();
const token = (u) =>
  jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
r.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password || password.length < 8)
      return res
        .status(400)
        .json({
          message: "Username, email and an 8+ character password are required",
        });
    if (
      await User.findOne({
        $or: [{ username }, { email: email.toLowerCase() }],
      })
    )
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    const u = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res
      .status(201)
      .json({
        token: token(u),
        user: { id: u._id, username: u.username, email: u.email, bio: u.bio },
      });
  } catch (e) {
    res.status(500).json({ message: "Could not create account" });
  }
});
r.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const u = await User.findOne({
      $or: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    });
    if (!u || !(await bcrypt.compare(password, u.password)))
      return res.status(401).json({ message: "Incorrect credentials" });
    res.json({
      token: token(u),
      user: { id: u._id, username: u.username, email: u.email, bio: u.bio },
    });
  } catch (e) {
    res.status(500).json({ message: "Login failed" });
  }
});
r.post("/forgot-password", async (req, res) => {
  const { username, email, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8)
    return res
      .status(400)
      .json({ message: "New password must be 8+ characters" });
  const u = await User.findOne({ username, email: email.toLowerCase() });
  if (!u) return res.status(404).json({ message: "No matching account" });
  u.password = await bcrypt.hash(newPassword, 12);
  await u.save();
  res.json({ message: "Password updated. You can log in now." });
});
export default r;
