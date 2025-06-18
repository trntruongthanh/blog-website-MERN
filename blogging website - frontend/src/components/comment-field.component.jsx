import clsx from "clsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useContext, useState } from "react";

import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";

import Button from "./button";
import { useEffect } from "react";

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

const CommentField = ({ action }) => {
  const {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const {
    blog,
    blog: { comments, comments: { results: commentsArr } },
    setBlog,
    activity,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const _id = blog?._id;
  const blog_author = blog?.author?._id;
  const total_comments = activity?.total_comments ?? 0;
  const total_parent_comments = activity?.total_parent_comments ?? 0;

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
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // console.log(data)

      setComment("");

      data.commented_by = {
        personal_info: { username, fullname, profile_img },
      };

      let newCommentArr;

      data.childrenLevel = 0;

      newCommentArr = [data, ...commentsArr];

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
          "mt-5 border border-lavender bg-white text-black px-4 py-2 rounded-md",
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
