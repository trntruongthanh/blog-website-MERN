import express from "express";

import { searchUsers, getProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/search-users", searchUsers);
router.post("/get-profile", getProfile);

export default router;
