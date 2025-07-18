import toast from "react-hot-toast";
import axios from "axios";
import { useContext, useState, useEffect, useRef } from "react";

import { UserContext } from "@/App";
import { BlogContext } from "@/pages/blog.page";

import { CommentIcon, TrashIcon } from "@/Icons";

import { formatDateOnly } from "@/common/date";

import Button from "@/components/button";
import LoadMoreRepliesButton from "./loadMoreRepliesButton";

import CommentField from "./comment-field.component";

import loadReplies from "@/utils/comment-utils/loadReplies";
import hideReplies from "@/utils/comment-utils/hideReplies";
import removeCommentsCards from "@/utils/comment-utils/removeCommentsCards";

const CommentCard = ({ index, leftValue, commentData }) => {
  /*
  | Thuộc tính    | `commentsArr`                                       | `commentData`                         |
  | ------------- | --------------------------------------------------- | ------------------------------------- |
  | Loại          | Mảng (array)                                        | Đối tượng (object)                    |
  | Vai trò       | Danh sách tất cả comment đang hiển thị trên blog UI | Một comment cụ thể trong danh sách đó |
  | Nguồn dữ liệu | `blog.comments.results`                             | Một phần tử trong `commentsArr`       |
  | Dùng để       | Lặp qua để render UI, thao tác cập nhật xóa chèn    | Render ra một `CommentCard` cụ thể    |
  */

  let {
    commented_by: {
      personal_info: { fullname, username: commented_by_username, profile_img },
    },
    _id,
    comment,
    commentedAt,
    children,
  } = commentData;

  let {
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: { username: blog_author },
    },
    blog,
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const replyRef = useRef(null);

  // ======================= Toggle reply form & auto close =======================

  const handleReply = () => {
    if (!access_token) {
      return toast.error("Login first to leave a reply.");
    }

    setIsReplying((prev) => !prev);
  };

  /*
    Khi bạn nhấn "Reply", setIsReplying(true) → form hiện ra.
    useEffect chạy vì isReplying đổi thành true.
    Gắn mousedown listener toàn bộ document.
    Nếu người dùng click ngoài vùng replyRef → gọi setIsReplying(false) → ẩn form.
    Khi form ẩn đi (isReplying = false), useEffect sẽ tự động gỡ listener.

    | Thành phần                | Vai trò                                        |
    | ------------------------- | ---------------------------------------------- |
    | `replyRef.current`        | DOM node của form reply                        |
    | `.contains(event.target)` | Kiểm tra phần tử click có nằm trong form không |
    | `!contains(...)`          | Nghĩa là **click ra ngoài form**               |
    | `&&`                      | Tránh lỗi khi `replyRef.current` chưa tồn tại  |

    Auto đóng form khi click ra ngoài
  */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (replyRef.current && !replyRef.current.contains(event.target)) {
        setIsReplying(false);
      }
    };

    if (isReplying) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isReplying]);

  // ================================================================================================================================================

  const handleHideReplies = () => {
    hideReplies({
      index,
      commentData,
      commentsArr,
      blog,
      setBlog,
    });
  };

  // ================================================================================================================================================

  const handleLoadReplies = () => {
    loadReplies({
      skip: 0,
      index,
      commentData,
      commentsArr,
      blog,
      setBlog,
    });
  };

  // ======================= Xoá comment =======================
  const deleteComment = async (event) => {
    if (!access_token) {
      return toast.error("Login required.");
    }

    const btn = event.currentTarget;
    btn.setAttribute("disabled", true);

    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      removeCommentsCards({
        commentsArr,
        index,
        commentData,
        blog,
        setBlog,
        setTotalParentCommentsLoaded,
        isDelete: true,
      });
    } catch (error) {

      console.log(error);
      toast.error("Failed to delete comment.");

    } finally {
      btn.removeAttribute("disabled");
    }
  };

  // ==============================================================================================================================================================

  return (
    <div className="w-full" style={{ paddingLeft: `${leftValue * 10}px` }}>
      <div className="my-4 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{formatDateOnly(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <Button
              onClick={handleHideReplies}
              className="text-sm flex items-center p-2 px-2 gap-2 rounded-md"
            >
              <CommentIcon className="w-4 h-4" /> Hide
            </Button>
          ) : (
            <Button
              onClick={handleLoadReplies}
              className="text-sm flex items-center p-2 px-2 gap-2 rounded-md"
            >
              <CommentIcon className="w-4 h-4" /> {children.length}
            </Button>
          )}

          {!isReplying && (
            <Button
              className="text-sm p-2 px-2 rounded-md"
              onClick={handleReply}
            >
              Reply
            </Button>
          )}

          {access_token &&
            (username === commented_by_username || username === blog_author) && (
              <Button
                onClick={deleteComment}
                className="p-2 px-2 rounded-md ml-auto hover:bg-red/30 hover:text-red flex items-center"
              >
                <TrashIcon className="w-4 h-4 pointer-events-none" />
              </Button>
            )}
            
        </div>

        {isReplying && (
          <div ref={replyRef} className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setIsReplying={setIsReplying}
            />
          </div>
        )}
      </div>

      <LoadMoreRepliesButton commentData={commentData} index={index} />
    </div>
  );
};

export default CommentCard;
