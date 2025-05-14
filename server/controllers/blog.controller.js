import User from "../Schema/User.js";
import Blog from "../Schema/Blog.js";

import slugify from "../utils/slugify.js"; // Sử dụng slugify để tạo blog_id từ title


// Lấy blog mới nhất
export const getLatestBlogs = async (req, res) => {
  try {
    const { page } = req.body;
    const maxLimit = 5;

    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Đếm tổng số blog (latest)
export const getAllLatestBlogsCount = async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Lấy blog trending
export const getTrendingBlogs = async (req, res) => {
  try {
    const maxLimit = 5;

    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Tìm kiếm blog
// 1. /search-blogs – Trả về danh sách bài viết
// Mục đích: Trả về một trang các blog phù hợp với bộ lọc.
export const searchBlogs = async (req, res) => {
  try {
    const { tag, page, query, author } = req.body;

    const maxLimit = 2;
    let findQuery;

    if (tag) {
      findQuery = { tags: tag, draft: false };
      
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };

    } else if (author) {
      findQuery = { draft: false, author }
    }

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Đếm số kết quả tìm kiếm  2. /search-blogs-count – Đếm tổng số blog phù hợp
// Mục đích: Trả về số lượng tổng cộng các blog phù hợp với điều kiện lọc.
export const searchBlogsCount = async (req, res) => {
  try {
    const { tag, query, author } = req.body;
    let findQuery;

    if (tag) {
      findQuery = { tags: tag, draft: false };

    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };

    } else if (author) {
      findQuery = { draft: false, author }
    }

    /*
      countDocuments(findQuery) là hàm của Mongoose dùng để đếm số lượng tài liệu (document) khớp với findQuery trong collection Blog.
    */
    const count = await Blog.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
    
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};


// Tạo blog mới
export const createBlog = async (req, res) => {
  let authorId = req.user; // ID của tác giả từ middleware verifyJWT

  let { title, des, banner, tags, content, draft } = req.body;

  // ================= Validation ===================

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  // ================== Xử lý ===================

  // Chuyển tất cả tag thành chữ thường để đồng nhất.
  tags = tags.map((tag) => tag.toLowerCase());

  // Tạo blog_id từ title
  let blog_id = slugify(title);

  let blog = new Blog({
    title,
    banner,
    des,
    tags,
    content,
    blog_id,
    author: authorId,
    draft: Boolean(draft),
  });

  // Nếu là bản nháp (draft), không tăng số lượng bài viết. Nếu là bài thật, tăng 1 vào account_info.total_posts.
  try {
    const savedBlog = await blog.save();

    const incrementValue = draft ? 0 : 1;

    try {
      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementValue },
          $push: { blogs: savedBlog._id },
        }
      );
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Failed to update total posts number" });
    }

    return res.status(200).json({ id: savedBlog.blog_id });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create blog" });
  }
};
