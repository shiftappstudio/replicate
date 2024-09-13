import express from "express";
import { deleteUser_TV } from "../controllers/fireabase.controllers";
const router = express.Router();

router.delete("/turf_visualizer/user", deleteUser_TV);

export { router as FirebaseRoutes };
