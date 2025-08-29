// upload.routes.js
import express from "express";
import { getUploadURL } from "../controllers/upload.controller.js";

const router = express.Router();

router.get("/get-upload-url", getUploadURL);

export default router;
