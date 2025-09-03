import express from 'express';
import verifyJWT from "../middlewares/verifyJWT.js";
import { newNotification } from '../controllers/notification.controller.js';


const router = express.Router();

router.get("/new-notification", verifyJWT, newNotification)


export default router;