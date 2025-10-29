import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { UserContext } from "@/App";
import { formatDateOnly } from "@/common/date";

import Button from "../button";
import NotificationCommentField from "./notification-comment-field.component";
import { useTheme } from "@/hooks/useTheme";

const NotificationCard = ({ data, index, notificationState }) => {
  // `user` ở đây là "actor" (người thực hiện hành động: like/comment/reply), KHÔNG PHẢI current user
  const {
    _id: notification_id,
    type,
    replied_on_comment: { comment: repliedComment } = {},
    user: {
      personal_info: { fullname, username, profile_img },
    },
    blog: { _id: blogObjectId, blog_id, title, author: blog_author },
    comment,
    comment: commentObj = {},
    createdAt,
    reply,
    seen,
  } = data;

  // ==== Lấy current user từ context (đây mới là người đang đăng nhập)
  const {
    userAuth: {
      access_token,
      username: author_username,
      fullname: author_fullname,
      profile_img: author_profile_img,
    },
  } = useContext(UserContext);

  // ==== State notifications toàn cục (đang list trong trang)
  const {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const [isReplying, setIsReplying] = useState(false);

  const { theme, setTheme } = useTheme();

  // =========================================================================================

  // ==== Lấy nội dung & chủ của comment chính ====
  const commentBlog = commentObj?.comment;
  const commentedBy = commentObj?.commented_by;

  // check chỉ được xóa comment của chủ sở hữu
  // Nếu chưa populate: là ObjectId -> typeof === 'string' (hoặc 'object' nhưng không có personal_info), ta fallback undefined
  const commented_by_username =
    commentedBy && typeof commentedBy === "object"
      ? commentedBy.personal_info?.username
      : undefined;

  // ==== Chủ của reply (nếu có reply block render bên dưới)
  const replyOwnerUsername =
    reply?.commented_by && typeof reply.commented_by === "object"
      ? reply.commented_by.personal_info?.username
      : undefined;

  // ✅ Chuẩn hoá thành _id (string)
  const blogAuthorId =
    blog_author && typeof blog_author === "object" ? blog_author._id : blog_author;

  useEffect(() => {
    console.log(data);
  });

  // =========================================================================================

  // Toggle mở/đóng ô reply cho notification này
  const handleReplies = () => {
    setIsReplying((prev) => !prev);
  };

  // Xóa comment/reply (tùy type = "comment" | "reply") qua API backend
  // - comment_id: id của comment/reply muốn xóa
  // - type: 'comment' | 'reply'
  // - target: DOM button để disable/enable trong lúc gọi API
  const handleDelete = async (comment_id, type, target) => {
    target.setAttribute("disabled", true); // tắt nút để tránh double click

    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        {
          _id: comment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Clone mảng để cập nhật UI
      const newResults = [...results];

      if (type === "comment") {
        // Nếu xóa cả comment (notification gắn với comment) → bỏ luôn noti khỏi list
        newResults.splice(index, 1);
      } else {
        // Nếu xóa reply gắn kèm → giữ noti, nhưng xóa trường reply để UI ẩn block reply
        newResults[index] = { ...newResults[index], reply: undefined };
      }

      /*
        Nếu type === "reply" thì không nên totalDocs - 1 (vì bạn không xoá card noti). Chỉ giảm khi xoá comment
      */
      setNotifications({
        ...notifications,
        results: newResults,
        totalDocs: type === "comment" ? totalDocs - 1 : totalDocs,
        deleteDocCount: (notifications.deleteDocCount ?? 0) + 1,
      });
    } catch (error) {
      console.log(error);
    } finally {
      target.removeAttribute("disabled");
    }
  };

  // =========================================================================================

  // Chỉ hiện nút Delete khi current user là chủ comment/reply
  const isOwnerOfComment = Boolean(access_token) && author_username === commented_by_username;
  const isOwnerOfReply =
    Boolean(access_token) && (reply?.mine || author_username === replyOwnerUsername);

  return (
    <div className={"p-6 border-b border-grey border-l-dark-grey " + (!seen ? "border-l-2" : "")}>
      <div className="flex gap-5 mb-3">
        {/* Avatar của actor (người thực hiện hành động) */}
        <img src={profile_img} className="h-8 w-8 rounded-full flex-none" />

        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            {/* Tên hiển thị + link profile actor */}
            <span className="lg:inline-block hidden capitalize">{fullname}</span>
            <Link className="mx-1 text-black underline" to={`/user/${username}`}>
              @{username}
            </Link>

            {/* Chuỗi mô tả theo type noti */}
            <span className="font-normal">
              {type === "like"
                ? "Liked your blog"
                : type === "comment"
                ? "Commented on your blog"
                : type === "reply"
                ? "Replied to your comment"
                : type === "follows"
                ? "Started following you"
                : type === "mentions"
                ? "Mentioned you in a comment"
                : ""}
            </span>
          </h1>

          {/* Nếu là reply, show trích nội dung comment gốc; nếu không, show link blog */}
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{repliedComment}</p>
            </div>
          ) : (
            <Link
              className="font-medium text-dark-grey hover:underline line-clamp-1 mt-2"
              to={`/blog/${blog_id}`}
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>

      {/* Nếu không phải like thì hiển thị phần nội dung comment chính */}
      {type !== "like" ? <p className="ml-8 pl-5 font-gelasio text-xl my-5">{commentBlog}</p> : ""}

      <div className="ml-8 pl-5 mt-4 text-dark-grey flex gap-8">
        {/* Thời gian tạo notification (đã format) */}
        <p className="font-normal text-base mt-2">{formatDateOnly(createdAt)}</p>

        {/* Khối nút hành động: Reply/Delete (chỉ với noti liên quan đến comment/reply) */}
        {type !== "like" ? (
          <div className="ml-10">
            {/* Nếu chưa có reply đính kèm -> cho phép mở ô reply */}
            {!reply ? (
              <Button
                onClick={handleReplies}
                className={
                  "hover:text-black p-2 rounded-md mr-2 " +
                  (theme === "dark" ? "hover:bg-slate-600" : " ")
                }
              >
                Reply
              </Button>
            ) : (
              ""
            )}

            {/* Chỉ chủ comment mới thấy nút Delete của comment */}
            {isOwnerOfComment && (
              <Button
                onClick={(event) =>
                  comment?._id && handleDelete(comment._id, "comment", event.currentTarget)
                }
                className="hover:text-black p-2 rounded-md"
              >
                Delete
              </Button>
            )}
          </div>
        ) : (
          " "
        )}
      </div>

      {/*
        Form gửi reply tại màn hình notification.

        - blog_id: ObjectId của blog (để backend gắn comment đúng blog)
        - blog_author: user nhận noti (actor? hay author blog), ở đây bạn pass `user` (lưu ý đúng vai trò backend mong đợi)
        - index: vị trí của noti trong mảng (phục vụ cập nhật UI)
        - replyingTo: id của comment gốc (sẽ trở thành parent)
        - replyingToName: tên actor được reply (để hiển thị)
        - notification_id: id noti để backend update trạng thái seen/đính reply...
        - notificationData: state toàn cục để cập nhật lại list noti
      */}

      {isReplying ? (
        <div className="mt-8">
          <NotificationCommentField
            blog_id={blogObjectId}
            blog_author={blogAuthorId}
            index={index}
            replyingTo={comment._id}
            replyingToName={username}
            setIsReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      ) : (
        ""
      )}

      {/* Block hiển thị reply đã có (nếu API trả kèm) */}
      {reply ? (
        <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            {/* Avatar current user (vì reply này là của bạn theo thiết kế) */}
            <img className="h-8 w-8 rounded-full flex-none" src={author_profile_img} />

            <div className="w-full">
              <h1 className="font-medium text-xl text-dark-grey">
                <span className="lg:inline-block hidden capitalize">{author_fullname}</span>

                <Link className="mx-1 text-black underline" to={`/user/${author_username}`}>
                  @{author_username}
                </Link>

                <span className="font-normal">Replied to</span>

                <Link className="mx-1 text-black underline" to={`/user/${username}`}>
                  @{username}
                </Link>
              </h1>
            </div>
          </div>

          <p className="ml-14 text-xl font-gelasio my-2">{reply.comment}</p>

          {/* Chỉ chủ reply mới thấy nút Delete reply */}
          {isOwnerOfReply && (
            <Button
              onClick={(event) => handleDelete(reply._id, "reply", event.currentTarget)}
              className={
                "text-dark-grey p-2 rounded-md hover:text-black ml-14 mt-2 " +
                (theme === "dark" ? "hover:bg-slate-600" : " ")
              }
            >
              Delete
            </Button>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
