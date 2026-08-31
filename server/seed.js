import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Story from "./models/Story.js";
import Place from "./models/Place.js";
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([
  User.deleteMany({}),
  Story.deleteMany({}),
  Place.deleteMany({}),
]);
const pass = await bcrypt.hash("retroheads123", 12);
const [a, b] = await User.create([
  {
    username: "memorykeeper",
    email: "memory@retroheads.local",
    password: pass,
    bio: "Saving the moments that deserve another look.",
    favoriteEra: "2000s",
  },
  {
    username: "oldschool",
    email: "oldschool@retroheads.local",
    password: pass,
    bio: "Places, people and tiny stories.",
    favoriteEra: "90s",
  },
]);
await Story.create([
  {
    author: a._id,
    title: "The last summer before everything changed",
    story:
      "We spent every evening outside until the street lights came on. Nobody carried a phone. We just knew where everyone would be.",
    mood: "warm",
    tags: ["summer", "friends", "childhood"],
    location: "Lucknow",
    year: 2008,
  },
  {
    author: b._id,
    title: "That tiny shop near school",
    story:
      "Five rupees, a cold drink and an hour of stories after class. Somehow that was enough for a perfect afternoon.",
    mood: "joyful",
    tags: ["school", "friends", "snacks"],
    location: "Kanpur",
    year: 2006,
  },
]);
await Place.create({
  author: a._id,
  placeName: "The Old Playground",
  city: "Lucknow",
  state: "Uttar Pradesh",
  description: "The place where every evening turned into a new adventure.",
  bestTimeToVisit: "Winter evenings",
  memory: "Come just before sunset.",
  photo: "",
});
console.log("Seeded. Demo password: retroheads123");
await mongoose.disconnect();
