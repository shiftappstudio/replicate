import express from "express";
import {
  ai_adonisHandler,
  ai_packager_handler,
  clotheChangerAiHandler,
  generateImageSegmentation,
  generateImageVariation,
  lucataco_sdxl_handler,
  productVisualiserHandler,
  profileGeneratorHandler,
  promptToImage,
  turf_visualizer_handler,
} from "../controllers/images.controllers";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/lucataco_sdxl", lucataco_sdxl_handler);
router.post("/turf-visualizer", turf_visualizer_handler);
//
router.post("/ai-interior-design/segmentation", generateImageSegmentation);
router.post("/ai-interior-design/generate", generateImageVariation);
//
router.post("/ai-packager", ai_packager_handler);
router.post("/profile/generate", profileGeneratorHandler);
router.post("/ai-backdrop", productVisualiserHandler);
//
router.post("/ai-adonis", ai_adonisHandler);
router.post("/prompt2image", promptToImage);
router.post("/ai_clothes_changer", clotheChangerAiHandler);
export { router as ImageRoutes };
