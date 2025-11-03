import User from "../Schema/User.js";
import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

import slugify from "../utils/slugify.js"; // Sử dụng slugify để tạo blog_id từ title

/*
  findOne(filter)
  Tìm document đầu tiên phù hợp với filter.
  Không thay đổi gì trong DB.
  Trả về 1 document hoặc null.

  Dùng khi:
  Cần kiểm tra user tồn tại.
  Cần lấy chi tiết blog/user/email duy nhất.

  find(filter)
  Trả về tất cả documents khớp với filter.
  Không giới hạn số lượng (trừ khi có .limit()).
  Luôn trả về mảng (kể cả khi chỉ có 1 document).

  Dùng khi:
  Cần danh sách bài viết, danh sách người dùng, v.v...

  findOneAndUpdate(filter, update, options?)
  Tìm 1 document theo filter, sau đó cập nhật nó ngay.
  Trả về document trước khi cập nhật (mặc định), hoặc sau khi cập nhật nếu thêm { new: true }.

  Dùng khi:
  Muốn cập nhật và trả kết quả về ngay (như tăng lượt đọc, like, sửa thông tin...).
  Tránh phải gọi findOne rồi save() tách biệt.


  | Tình huống                         | Dùng gì?             |
  | ---------------------------------- | -------------------- |
  | Cần lấy 1 bản ghi duy nhất         | `findOne()`          |
  | Cần lấy danh sách nhiều bản ghi    | `find()`             |
  | Cần vừa tìm vừa cập nhật 1 bản ghi | `findOneAndUpdate()` |

*/

//============================================================================================

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

//============================================================================================

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

//===========================================================================================

/*
  Tìm kiếm blog
  1. /search-blogs – Trả về danh sách bài viết
  Mục đích: Trả về một trang các blog phù hợp với bộ lọc.
*/
export const searchBlogs = async (req, res) => {
  try {
    const { tag, page, query, author, limit, eliminate_blog } = req.body;

    const maxLimit = limit ? limit : 2;
    let findQuery;

    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { draft: false, author };
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

//===========================================================================================

// Đếm số kết quả tìm kiếm  2. /search-blogs-count – Đếm tổng số blog phù hợp
// Mục đích: Trả về số lượng tổng cộng các blog phù hợp với điều kiện lọc.
export const searchBlogsCount = async (req, res) => {
  try {
    const { tag, query, author } = req.body;
    let findQuery;

    /*
      new RegExp(query, "i") tạo ra một biểu thức chính quy (regular expression) trong JavaScript.
      query là chuỗi mà bạn muốn tìm.
      "i" là flag (cờ) cho biết tìm không phân biệt chữ hoa chữ thường (case-insensitive).
    */

    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { draft: false, author };
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

//========================================================================================

// Tạo blog mới
export const createBlog = async (req, res) => {
  let authorId = req.user; // ID của tác giả từ middleware verifyJWT
  let isAdmin = req.admin;

  if (!isAdmin) {
    return res.status(403).json({ error: "Only admins can create or edit blogs" });
  }

  let { title, des, banner, tags, content, draft, id } = req.body;


  // Kiểm tra tiêu đề có tồn tại không
  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  // Nếu không phải bản nháp thì cần kiểm tra thêm các trường khác
  if (!draft) {
    // Mô tả phải có và không được vượt quá 200 ký tự
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    // Banner (ảnh chính của blog) phải tồn tại nếu không phải nháp
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    // Nội dung blog phải có ít nhất một khối nội dung
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    // Tags phải có, và không được nhiều hơn 10 tag
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  // Chuyển tất cả tag thành chữ thường để đồng nhất.
  tags = tags.map((tag) => tag.toLowerCase());

  // Tạo blog_id từ title
  let blog_id = id || slugify(title);


  if (id) {
    try {
      await Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, draft: draft ? draft : false }
      );

      return res.status(200).json({ id: blog_id });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to update blog" });
    }
  } else {
    
    let blog = new Blog({
      title,
      banner,
      des,
      tags,
      content,
      blog_id,
      author: authorId,
      draft: Boolean(draft), // true nếu là bản nháp, false nếu là bài thật
    });
    

    // ===== CREATE =====
    try {
      // Lưu blog vào database
      const savedBlog = await blog.save();

      // Nếu là bản nháp (draft), không tăng số lượng bài viết. Nếu là bài thật, tăng 1 vào account_info.total_posts.
      const incrementValue = draft ? 0 : 1;

      try {
        /*
        { _id: authorId }
        Đây là điều kiện truy vấn (filter) – MongoDB sẽ tìm một document trong collection User có _id bằng authorId.
        
        { $inc: ..., $push: ... }
        Đây là đối tượng cập nhật (update object), trong đó có sử dụng hai toán tử MongoDB:
        $inc sẽ tăng giá trị hiện tại của total_posts lên đúng bằng incrementValue.
        $push sẽ thêm savedBlog._id (ID của blog vừa tạo) vào cuối mảng blogs của user.

        _id – ID mặc định của MongoDB
        Tự động được sinh ra bởi MongoDB.
        Vì vậy, khi bạn push blog vào mảng blogs của User, bạn dùng savedBlog._id

        | Trường              | Ý nghĩa                        | Dùng để làm gì                            |
        | ------------------- | ------------------------------ | ----------------------------------------- |
        | `savedBlog._id`     | ID thật của MongoDB (ObjectId) | Tham chiếu dữ liệu, lưu vào user.blogs    |
        | `savedBlog.blog_id` | Slug từ tiêu đề, do bạn tự tạo | Dùng trong URL hoặc hiển thị ra bên ngoài |

      */
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
  }
};

//===========================================================================================

// Controller để lấy thông tin chi tiết 1 blog (và tăng số lượt đọc)
export const getBlog = async (req, res) => {
  try {
    // Lấy blog_id từ body của request gửi lên (thường là từ client)
    let { blog_id, draft, mode } = req.body;

    // Số lượt đọc sẽ tăng thêm 1 mỗi lần blog được đọc
    let incrementValue = mode !== "edit" ? 1 : 0;

    /*
      Tìm blog theo blog_id, đồng thời:
      - Tăng số lượt đọc (`activity.total_reads`) lên 1
      - (Populate) để lấy thông tin tác giả (chỉ lấy fullname, username, profile_img)
      - Chỉ chọn các trường cần thiết (select)

      findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": 1 } })
      Tìm blog theo blog_id (là slug, dạng thân thiện URL).
      Dùng $inc để tăng số lượt đọc (total_reads) trong object activity lên 1.

      .populate("author", "...")
      Lấy thông tin người dùng từ collection User liên kết qua author (có kiểu ObjectId).
      Chỉ chọn các trường trong personal_info: fullname, username, profile_img.
      Đây là cách hiển thị thông tin tác giả kèm theo blog mà không cần thêm API khác.

      .select(...)
      Giới hạn dữ liệu trả về, chỉ bao gồm các trường cần thiết:
      title, des, content, banner, activity, publishedAt, blog_id, tags
      Nhờ đó giúp giảm dung lượng response và tăng tốc độ API.

      populate(...) → áp dụng cho author (tức là document bên trong User collection).
      Lấy chỉ fullname, username, profile_img của người dùng.
      .select(...) → áp dụng cho document Blog gốc.
      Lấy chỉ các field cần thiết của bài viết (như title, des, banner...).
    */
    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementValue } }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select(
        "title des content banner activity publishedAt blog_id tags draft"
      );

    try {
      await User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        {
          $inc: { "account_info.total_reads": incrementValue },
        }
      );
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

    /*
        Giải thích chi tiết
      blog.draft: là trạng thái của bài viết, true nghĩa là bài viết là bản nháp, chưa được xuất bản.
      draft: là giá trị client gửi lên, thường là true hoặc false, báo với server rằng client có quyền xem bản nháp hay không.

      Gọi API không gửi draft = chỉ xem được blog đã xuất bản (không phải bản nháp).
      Muốn xem blog draft phải gọi API và gửi { blog_id, draft: true }.
    */
    if (blog.draft && !draft) {
      return res.status(500).json({ error: "you can not access draft blogs" });
    }

    return res.status(200).json({ blog });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//========================== API Dashboard sidebar blogs =================================================================

// This endpoint returns a paginated list of blogs written by the logged-in user.
export const userWrittenBlogs = async (req, res) => {
  const user_id = req.user;

  const { page, draft, query, deleteDocCount } = req.body;

  const maxLimit = 5;

  let skipDocs = Math.max(0, (page - 1) * maxLimit - (deleteDocCount || 0));

  let findQuery = {
    author: user_id,
    draft: draft === true ? true : false,
    ...(query ? { title: new RegExp(query, "i") } : {}), // chỉ thêm khi có query
  };

  try {
    let blogs = await Blog.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select("title banner blog_id activity des draft publishedAt -_id"); // chỉ lấy những field này loại bỏ _id

    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//===========================================================================================

// This endpoint returns the total number of blogs (published or draft) for pagination purposes.
export const userWrittenBlogsCount = async (req, res) => {
  const user_id = req.user;

  const { draft, query } = req.body;

  try {
    let findQuery = {
      author: user_id,
      draft: draft === true ? true : false,
      ...(query ? { title: new RegExp(query, "i") } : {}), // chỉ thêm khi có query
    };

    const count = await Blog.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//===========================================================================================

export const deleteBlog = async (req, res) => {
  const user_id = req.user;
  const isAdmin = req.admin;

  const { blog_id } = req.body;

  if (!isAdmin) {
    return res.status(500).json({ error: "Only admins can delete blogs" });
  }

  try {
    const blog = await Blog.findOneAndDelete({ blog_id });

    await Notification.deleteMany({ blog: blog._id });

    await Comment.deleteMany({ blog_id: blog._id });

    await User.findOneAndUpdate(
      { _id: user_id },
      { $pull: { blogs: blog._id }, $inc: { "account_info.total_posts": -1 } }
    );

    return res.status(200).json({ message: "Blog deleted successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
