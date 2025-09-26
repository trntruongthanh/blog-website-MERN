import express from 'express';
import verifyJWT from "../middlewares/verifyJWT.js";

import { allNotificationsCount, newNotification, notifications } from '../controllers/notification.controller.js';


const router = express.Router();

router.get("/new-notification", verifyJWT, newNotification)
router.post("/notifications", verifyJWT, notifications)
router.post("/all-notifications-count", verifyJWT, allNotificationsCount)


export default router;