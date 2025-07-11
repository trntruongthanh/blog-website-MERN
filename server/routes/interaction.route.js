import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";

import {
  isLiked,
  likeBlogInteraction,
  addCommentInteraction,
  getBlogComments,
  getReplies,
  deleteComment
} from "../controllers/interaction.controller.js";

const router = express.Router();

router.post("/like-blog", verifyJWT, likeBlogInteraction);
router.post("/isliked-by-user", verifyJWT, isLiked);
router.post("/add-comment", verifyJWT, addCommentInteraction);
router.post("/get-blog-comments", getBlogComments)
router.post("/get-replies", getReplies)
router.post("/delete-comment", verifyJWT, deleteComment)

export default router;
