import { Request, Response } from "express";
import Game from "../models/Game";

export const getGameState = async (_: Request, res: Response) => {
  const state = await Game.findOne().sort({ updatedAt: -1 });
  res.json(state);
};

export const saveGameState = async (req: Request, res: Response) => {
  const state = new Game(req.body);
  await state.save();
  res.json({ success: true });
};
