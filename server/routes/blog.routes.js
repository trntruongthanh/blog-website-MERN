import express from "express";
import {
  createBlog,
  getLatestBlogs,
  getAllLatestBlogsCount,
  getTrendingBlogs,
  searchBlogs,
  searchBlogsCount,
} from "../controllers/blog.controller.js";

import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/create-blog", verifyJWT, createBlog);
router.post("/latest-blogs", getLatestBlogs);
router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/search-blogs-count", searchBlogsCount);

export default router;
