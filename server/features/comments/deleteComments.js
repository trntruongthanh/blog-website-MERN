import Blog from "../../Schema/Blog.js";
import Comment from "../../Schema/Comment.js";
import Notification from "../../Schema/Notification.js";

const deleteComments = async (_id) => {
  try {

    /*
        1. Tìm comment cần xóa trong DB.
        → comment là document bình luận được lấy ra.

        2. Nếu không tìm thấy comment → thoát sớm, không làm gì nữa.

        3. Nếu comment hiện tại là reply, nó có một comment cha.
        Gỡ _id của comment hiện tại khỏi mảng children[] của comment cha.
        → Tức là gỡ quan hệ cha-con trong cây bình luận.

        | Thành phần                      | Ý nghĩa                                                                            |
        | ------------------------------- | ---------------------------------------------------------------------------------- |
        | `Comment.findOneAndUpdate(...)` | Tìm một document trong collection `Comment` và **cập nhật nó**                     |
        | `{ _id: comment.parent }`       | Điều kiện tìm: tìm comment có `_id` là `comment.parent` (cha của comment hiện tại) |
        | `{ $pull: { children: _id } }`  | **Xoá phần tử `_id` khỏi mảng `children`** trong comment cha                       |

        Giả sử bạn có cây bình luận:
            Comment A (cha)
            ├── Reply A1
            │   └── Reply A1.1
            └── Reply A2
            
            Khi gọi deleteComments("A"):
            Xóa từng reply con:
            Gọi deleteComments("A1") → gọi tiếp deleteComments("A1.1")
            Gọi deleteComments("A2")
            Gỡ chúng khỏi blog/comments/notifications
            Sau cùng, xóa A.
    */

    const comment = await Comment.findOne({ _id });

    if (!comment) return;

    // Gỡ khỏi comment cha nếu có
    if (comment.parent) {
      await Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      );
    }

    /* Xoá toàn bộ notification liên quan 
    | Thành phần                     | Giải thích                                                                             |
    | ------------------------------ | -------------------------------------------------------------------------------------- |
    | `Notification.deleteMany(...)` | Xoá tất cả các document trong collection `Notification` mà **thoả điều kiện**          |
    | `$or: [...]`                   | Điều kiện **hoặc** – nếu **ít nhất một** trong các điều kiện bên trong đúng            |
    | `{ comment: _id }`             | Tìm thông báo có trường `comment` bằng `_id` này (tức là liên quan đến comment bị xoá) |
    | `{ reply: _id }`               | Hoặc thông báo có trường `reply` bằng `_id` này (tức là liên quan đến reply bị xoá)    |
    */
    await Notification.deleteMany({
      $or: [{ comment: _id }, { reply: _id }],
    });


    /*
        Gỡ khỏi blog + cập nhật counters
        Dòng thứ nhất luôn giảm tổng số comment (total_comments).
        Dòng thứ hai chỉ giảm số comment cha (total_parent_comments) nếu comment đang xoá là comment cha.
    */
    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
        },
    );

    // Xoá đệ quy các reply con
    for (const replyId of comment.children) {
      await deleteComments(replyId);
    }

    // Xoá chính comment
    await Comment.findByIdAndDelete(_id);

  } catch (error) {
    console.log(error.message);
  }
};

export default deleteComments;
