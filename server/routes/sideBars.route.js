import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";

import { changePassword } from "../controllers/sideBars.controller.js";

const router = express.Router();

router.post("/change-password", verifyJWT, changePassword);

export default router;
