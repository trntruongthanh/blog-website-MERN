import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

// 📌 API xử lý khi người dùng like / unlike blog
export const likeBlogInteraction = async (req, res) => {
  // ID của user đang đăng nhập (được lấy từ middleware xác thực)
  let user_id = req.user;

  let { _id, isLikedByUser } = req.body; // _id là ID của blog, isLikedByUser là trạng thái cũ (trước khi bấm)

  /*
    💡 Giải thích logic:
    - isLikedByUser là trạng thái CŨ (trước khi người dùng bấm like/unlike).
    - Server dùng !isLikedByUser để xác định hành động mới là gì:
      - Nếu isLikedByUser === false → người dùng CHƯA like → giờ MUỐN like → +1 like
      - Nếu isLikedByUser === true  → người dùng ĐÃ like  → giờ MUỐN unlike → -1 like
  */

  let incrementValue = !isLikedByUser ? 1 : -1;

  try {
    // Cập nhật số lượng like của blog
    let blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementValue } }
    );

    if (!isLikedByUser) {
      /* Nếu người dùng vừa bấm LIKE → tạo thông báo cho tác giả
        🔔 Loại thông báo là "like"
        📚 Blog nào được like (ID của blog)
        👤 Ai sẽ nhận thông báo? → Tác giả của blog đó
        🙋 Ai là người đã like? (ID người dùng hiện tại)
      */
      let likeNotification = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      await likeNotification.save();

      return res.status(200).json({ liked_by_user: true }); // Trả về trạng thái mới là đã like
    } else {
      // Nếu người dùng vừa bấm UNLIKE → xoá thông báo like trước đó (nếu có)
      await Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });

      return res.status(200).json({ liked_by_user: false }); // Trả về trạng thái mới là đã unlike
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================================================================

// 📌 API kiểm tra xem user hiện tại đã like blog này chưa
export const isLiked = async (req, res) => {
  let user_id = req.user;

  let { _id } = req.body; // _id là ID của blog

  try {
    // Tìm xem có thông báo like nào từ user này cho blog này không
    const result = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({ result }); // true nếu đã like, false nếu chưa
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================================================================

export const addCommentInteraction = async (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!comment?.trim()) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment" });
  }

  try {
    // Tạo comment mới
    const commentObj = new Comment({
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
    });

    const commentFile = await commentObj.save();

    const { comment: savedComment, commentedAt, children } = commentFile;

    /*
      Cập nhật collection Blog tương ứng:
      push thêm ID của comment vào mảng comments
      inc tăng số lượng comment tổng (total_comments) và comment cha (total_parent_comments) lên 1 đơn vị.
    */
    const blog = await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": 1,
        },
      }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    /* Tạo notification 
      ✅ Tạo một document notification mới với loại "comment":
      blog: ID của blog nhận comment
      notification_for: tác giả blog → người sẽ nhận thông báo
      user: người tạo comment (người kích hoạt)
      comment: ID comment tạo ra
    */
    const notificationObj = new Notification({
      type: "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    });

    await notificationObj.save();

    // Trả kết quả thành công
    return res.status(200).json({
      comment: savedComment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  } catch (error) {
    console.error("Error while adding comment:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", error: error.message });
  }
};

// ==========================================================================================

export const getBlogComments = async (req, res) => {
  let { blog_id, skip } = req.body;

  let maxLimit = 5;

  /*
    Tìm các documents trong collection Comment thỏa:
    blog_id trùng với blog cần lấy.
    isReply: false → nghĩa là chỉ lấy comment cha, không lấy reply.

    commented_by là một ObjectId trỏ đến User model.
    populate(...): truy vấn sang bảng User và chỉ lấy các trường cần:
    username, fullname, profile_img (nằm trong personal_info).
    Điều này giúp bạn có đầy đủ thông tin user để hiển thị avatar, tên người bình luận, v.v.

    .skip(skip): bỏ qua skip comment đầu tiên (ví dụ đã load 5 thì skip = 5).
    .limit(maxLimit): lấy tối đa 5 comment tiếp theo.
    Dùng để tải thêm comment khi người dùng cuộn xuống (infinite scroll).

    Sắp xếp theo commentedAt (timestamp tạo comment) theo thứ tự mới nhất → cũ nhất.
    -1 = descending (giảm dần).
  */

  try {
    let comment = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    return res.status(200).json({ comment });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
