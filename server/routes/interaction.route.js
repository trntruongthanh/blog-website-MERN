import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";

import { isLiked, likeBlogInteraction } from "../controllers/interaction.controller.js";


const router = express.Router();

router.post("/like-blog", verifyJWT, likeBlogInteraction);
router.post("/isliked-by-user", verifyJWT, isLiked)

export default router;
