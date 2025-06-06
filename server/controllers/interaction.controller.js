import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";

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

      return res.status(200).json({ liked_by_user: false });  // Trả về trạng thái mới là đã unlike
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================================================================

// 📌 API kiểm tra xem user hiện tại đã like blog này chưa
export const isLiked = async (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;   // _id là ID của blog

  try {
    // Tìm xem có thông báo like nào từ user này cho blog này không
    const result = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({ result });   // true nếu đã like, false nếu chưa
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
