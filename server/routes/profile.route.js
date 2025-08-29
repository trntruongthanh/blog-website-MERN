import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { updatePersonalInfo, updateProfileImg } from "../controllers/profile.controller.js";


const router = express.Router();

router.post("/update-profile-img", verifyJWT, updateProfileImg)
router.post("/update-profile", verifyJWT, updatePersonalInfo)

export default router;