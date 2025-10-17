import express from "express";
import {
  createBlog,
  getLatestBlogs,
  getAllLatestBlogsCount,
  getTrendingBlogs,
  searchBlogs,
  searchBlogsCount,
  getBlog,
  userWrittenBlogs,
  userWrittenBlogsCount,
  deleteBlog,
} from "../controllers/blog.controller.js";

import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

// ========================== API Public blogs =================================================================
router.post("/create-blog", verifyJWT, createBlog);
router.post("/latest-blogs", getLatestBlogs);
router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/search-blogs-count", searchBlogsCount);
router.post("/get-blog", getBlog);

// ========================== API Dashboard sidebar blogs =================================================================
router.post("/user-written-blogs", verifyJWT, userWrittenBlogs);
router.post("/user-written-blogs-count", verifyJWT, userWrittenBlogsCount);
router.post("/delete-blog", verifyJWT, deleteBlog);

export default router;
