import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

import deleteComments from "../features/comments/deleteComments.js";

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
  const { _id, comment, blog_author, replying_to } = req.body;

  // ⚠️ Kiểm tra dữ liệu đầu vào: nếu người dùng gửi comment rỗng (chỉ chứa khoảng trắng) thì báo lỗi
  if (!comment?.trim()) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment" });
  }

  try {
    // 🛠️ Tạo đối tượng comment mới
    const commentObj = {
      blog_id: _id, // ID của blog được comment
      blog_author, // ID tác giả của blog
      comment, // Nội dung comment
      commented_by: user_id, // Người tạo comment
      isReply: replying_to ? true : false,
    };

    /*
      Nếu là phản hồi một comment khác → gán parent comment ID 
      replying_to là ID của comment gốc mà người dùng đang phản hồi.
      Nếu replying_to tồn tại (tức là người dùng đang reply chứ không phải viết comment mới), thì:
      Trường parent của comment mới sẽ được gán là replying_to.


      | Trường     | Vai trò                                   |
      | ---------- | ----------------------------------------- |
      | `isReply`  | Dùng để phân biệt comment cha vs reply    |
      | `parent`   | Dùng để biết reply thuộc comment cha nào  |
      | `children` | Dùng để biết comment cha có các reply nào |

    */
    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    } else {
      commentObj.isReply = false; // ✅ Gán là comment cha
    }

    // 💾 Lưu comment vào database (collection Comment)
    const commentFile = await new Comment(commentObj).save();

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
          "activity.total_parent_comments": replying_to ? 0 : 1,
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
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    });

    if (replying_to) {
      /*
        Gán ID comment mà user đang reply vào trường replied_on_comment của notification.
        Mục đích: sau này khi hiển thị thông báo kiểu:
        "User A đã phản hồi comment của bạn"
        → thì biết được comment nào đã bị phản hồi.

        Tìm comment gốc với _id = replying_to
        Cập nhật comment đó bằng cách:
        Thêm ID comment mới (commentFile._id) vào mảng children của comment gốc
        Tức là: gắn reply này làm "con" của comment gốc
        
        🔗 Mối quan hệ:
        Comment gốc → có children = [reply1_id, reply2_id, ...]
        Reply mới → có parent = comment_goc_id

        nhờ vậy bạn có thể xây dựng cây bình luận
        Comment A
        └── Reply A1
        └── Reply A2
        Comment B
        └── Reply B1
        
      */
      notificationObj.replied_on_comment = replying_to;

      let replyingToCommentDocs = await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      );

      // Cập nhật lại người nhận thông báo là chủ comment gốc (không phải tác giả blog)
      notificationObj.notification_for = replyingToCommentDocs.commented_by;
    }

    await notificationObj.save();

    // console.log("Saved notification:", notificationObj);

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
    Đây là mảng chứa toàn bộ các comment đang hiển thị, bao gồm:
    Comment cha (isReply: false)
    Comment con (isReply: true)

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

// ==========================================================================================

export const getReplies = async (req, res) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  /*
    skip: skip: bỏ qua số lượng replies đầu tiên theo biến skip
    limit: maxLimit: chỉ lấy tối đa maxLimit replies tiếp theo
    → giúp load từng đợt nhỏ (pagination)

    Comment cha → populate children (mảng reply)
    Mỗi reply → tiếp tục populate commented_by
  */
  try {
    let doc = await Comment.findOne({ _id })
      .populate({
        path: "children",             // 1️⃣ Populate mảng replies (ObjectId)
        options: {
          limit: maxLimit,            // 2️⃣ Lấy tối đa N replies
          skip: skip,                 // 3️⃣ Bỏ qua skip replies đầu tiên
          sort: { commentedAt: -1 },  // 4️⃣ Sắp xếp mới nhất trước
        },
        populate: {
          path: "commented_by",       // 5️⃣ Populate lồng: lấy thông tin user của từng reply
          select:
            "personal_info.profile_img personal_info.fullname personal_info.username",
        },
        select: "-blog_id -updatedAt",  // 6️⃣ Bỏ các trường không cần thiết trong replies
      })
      .select("children");              // 7️⃣ Chỉ lấy trường children từ comment cha

    return res.status(200).json({ replies: doc.children });
    
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

//==========================================================================================================

export const deleteComment = async (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  /*
    1. Tìm comment cần xóa trong database theo _id.
      → comment là một document kiểu Mongoose lấy ra từ Comment collection.
    
    2.
    | Điều kiện                          | Ý nghĩa                                                    |
    | ---------------------------------- | ---------------------------------------------------------- |
    | `user_id === comment.commented_by` | Nếu bạn là **người đã viết comment đó** → được xóa         |
    | `user_id === comment.blog_author`  | Nếu bạn là **tác giả của blog chứa comment đó** → được xóa |

    toString() để so sánh ID dạng ObjectId chính xác hơn (tránh lỗi type mismatch).
  
  */

  try {
    let comment = await Comment.findOne({ _id });

    if (user_id.toString() === comment.commented_by.toString() || user_id.toString() === comment.blog_author.toString()) {
      await deleteComments(_id);

      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ error: "You can not delete this comment" });
    }
  } catch (error) {

    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
