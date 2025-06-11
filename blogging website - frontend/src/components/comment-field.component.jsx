import clsx from "clsx";
import { useContext, useState } from "react";
import { BlogContext } from "../pages/blog.page";

import Button from "./Button";

const CommentField = ({ action }) => {
  const {
    blog: {
      author: {
        personal_info: { fullname },
      },
    },
  } = useContext(BlogContext);

  const [comment, setComment] = useState("");

  const hasComment = comment.trim() !== "";

  //========================================================================================

  return (
    <>
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
