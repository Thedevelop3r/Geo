import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import gameRoutes from "./routes/game.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/game", gameRoutes);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/geogame").then(() => {
  console.log("MongoDB connected");
  app.listen(4500, () => console.log("Server running on http://localhost:4500"));
});
