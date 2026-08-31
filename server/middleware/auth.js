import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required" });
    const token = h.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}
