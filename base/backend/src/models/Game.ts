import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    player: String,
    data: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Game", GameSchema);
