import { Router } from "express";
import { getGameState, saveGameState } from "../controllers/game.controller";

const router = Router();

router.get("/state", getGameState);
router.post("/state", saveGameState);

export default router;
