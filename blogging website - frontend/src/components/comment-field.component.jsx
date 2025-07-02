import clsx from "clsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useContext, useState } from "react";

import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";

import Button from "./button";

/*
  User->>Frontend: Click "Post Comment"
  Frontend->>Server: POST /add-comment-interaction
  Server->>MongoDB: Create Comment, Update Blog, Save Notification
  MongoDB-->>Server: Acknowledge
  Server-->>Frontend: Return comment data
  Frontend->>Frontend: Cập nhật UI và blog.comment.result
  User->>Frontend: Cuộn xem thêm comment
  Frontend->>Server: POST /get-blog-comments
  Server->>MongoDB: Tìm comment cha
  MongoDB-->>Server: Trả comment
  Server-->>Frontend: Gửi comment populated
  Frontend->>Frontend: Hiển thị thêm comment

  comment: nội dung text người dùng đang nhập.
  comments: object chứa các thông tin liên quan đến comment trong blog.
  commentsArr: mảng chứa các comment đã được load (hiển thị trong UI).
*/

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  const {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const {
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
    },
    setBlog,
    activity,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const _id = blog?._id;
  const blog_author = blog?.author?._id;

  const total_comments = activity?.total_comments ?? 0;
  const total_parent_comments = activity?.total_parent_comments ?? 0;

  //========================================================================================

  // console.log(blog);
  // console.log(commentsArr);

  const [comment, setComment] = useState("");

  const hasComment = comment.trim() !== ""; // xử lý nút comment khi có nội dung

  //========================================================================================

  const handleComment = async () => {
    if (!access_token) {
      return toast.error("Login first to leave a comment !");
    }

    if (!comment.length) {
      return toast.error("Write something to leave a comment...");
    }

    if (!comment.trim().length) {
      return toast.error("Write something to leave a comment...");
    }

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // console.log(data);

      setComment("");   // Reset khung nhập sau khi gửi thành công

      
      //📦 Server chỉ trả về ID người comment, nên ta thêm thủ công thông tin user hiện tại để render avatar/tên trong UI mà không cần fetch thêm.
      
      data.commented_by = {
        personal_info: { username, fullname, profile_img },
      };

      let newCommentArr;

      /* Có tồn tại replyingTo nghĩa là user đang phản hồi (reply) một comment khác 

        Thêm ID của reply mới vào mảng children của comment cha (được xác định bằng index trong mảng commentsArr). 
        Điều này giúp xây được mối quan hệ cha - con trong UI.

        Xác định cấp độ hiển thị của reply (ví dụ để canh lề trái).
        Nếu comment cha đang ở cấp độ 0 → reply sẽ ở cấp độ 1 → có thể dùng để indent trong UI.
      
        Ghi lại chỉ số index của comment cha → giúp sau này có thể tìm lại comment cha nếu cần (ví dụ khi collapse reply, cập nhật reply, v.v.)
      
        Đánh dấu comment cha đã load reply → giúp kiểm soát hiển thị (ví dụ tránh gọi API lại nữa).

        index + 1 → chèn ngay sau comment cha
        0 → không xóa phần tử nào
        data → là comment mới (reply)

        Gán lại mảng mới đã được cập nhật để dùng trong setBlog
      
        */
      if (replyingTo) {
        commentsArr[index].children.push(data._id);   

        data.childrenLevel = commentsArr[index].childrenLevel + 1;
        data.parentIndex = index;

        commentsArr[index].isReplyLoaded = true;

        commentsArr.splice(index + 1, 0, data);       // array.splice(start, deleteCount, item1, item2, ...)

        newCommentArr = commentsArr;

        setIsReplying(false);

      } else {

        /* Trường hợp là Comment cha (else) 
          Đây là comment trực tiếp vào blog (không phải reply), nên cấp độ = 0
          Thêm comment mới vào đầu danh sách comment cha (vì thường mới nhất sẽ hiển thị trước
        */
        data.childrenLevel = 0;

        newCommentArr = [data, ...commentsArr];
      }

      let parentCommentIncrementVal = 1;

      setBlog({
        ...blog,
        comments: {
          ...comments,
          results: newCommentArr,
        },
        activity: {
          ...activity,
          total_comments: total_comments + 1,
          total_parent_comments: total_parent_comments + parentCommentIncrementVal,
        },
      });

      setTotalParentCommentsLoaded((prev) => !prev + parentCommentIncrementVal);
    } catch (error) {
      console.log(error);
    }
  };

  //========================================================================================

  return (
    <>
      <Toaster />

      <textarea
        value={comment}
        placeholder={`Reply to ${fullname}...`}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      ></textarea>

      {/* 
        clsx(
          "các-class-cố-định",
          {
            "class-có-điều-kiện": điều_kiện_boolean,
          }
        )
      */}
      <Button
        onClick={handleComment}
        disabled={!hasComment}
        className={clsx(
          "mt-2 mb-4 border border-lavender bg-white text-black px-4 py-2 rounded-md",
          {
            "btn-shadow hover:bg-gray-200": hasComment,
          }
        )}
      >
        {action}
      </Button>
    </>
  );
};

export default CommentField;
