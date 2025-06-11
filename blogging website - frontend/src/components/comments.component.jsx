import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";

import Button from "./Button";
import { CrossMallIcon } from "../Icons";

import CommentField from "./comment-field.component";

const CommentContainer = () => {
  const {
    blog: { title },
    commentsWrapper,
    setCommentsWrapper,
  } = useContext(BlogContext);

  /*
  
    Khi commentsWrapper là true: phần tử được hiển thị
    Mobile: top-0 → đặt ở đầu màn hình
    Desktop: right-0 → khớp cạnh phải
    
    Khi false: phần tử bị đẩy ra ngoài khung nhìn
    Mobile: top-[100%] → đẩy ra khỏi màn hình theo chiều dọc
    Desktop: right-[-100%] → đẩy ra ngoài theo chiều ngang

    overflow-y-auto overflow-x-hidden
    Cuộn dọc nếu nội dung dài
    Không cuộn ngang
  */
  return (
    <div
      className={
        "max-sm:w-full fixed box-shadow-left " +
        (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") +
        " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"
      }
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comment</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>

        <Button
          onClick={() => setCommentsWrapper((prev) => !prev)}
          className="absolute top-0 right-0 flex justify-center items-center w-8 h-8 rounded-full bg-grey"
        >
          <CrossMallIcon />
        </Button>
      </div>

      <hr className="border-grey my-8 w-[140%] -ml-10" />
      
      <CommentField action="comment" />
    </div>
  );
};

export default CommentContainer;
