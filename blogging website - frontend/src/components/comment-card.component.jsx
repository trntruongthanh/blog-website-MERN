import toast from "react-hot-toast";
import { useContext, useState, useEffect, useRef } from "react";

import { UserContext } from "../App";

import { formatDateOnly } from "../common/date";
import Button from "./button";
import CommentField from "./comment-field.component";
import { CommentIcon } from "../Icons";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftValue, commentData }) => {

  let {
    commented_by: {
      personal_info: { fullname, username, profile_img },
    },
    _id,
    comment,
    commentedAt,
    children,
  } = commentData;

  let {
    blog: {
      comments,
      comments: { results: commentsArr },
    },
    blog,
    setBlog,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const replyRef = useRef(null);


  // =======================================================================================

  // Toggle form trả lời
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

  */

  // Auto đóng form khi click ra ngoài
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


  // =======================================================================================

  // Xóa các reply con khi hide
  const removeCommentsCards = (startingPoint) => {

    /*
      Xoá hết tất cả comment con có childrenLevel lớn hơn comment cha (commentData) bắt đầu từ startingPoint.

      Kiểm tra xem có comment nào bắt đầu từ startingPoint (tức là index + 1 trong hideReplies) không.
      commentData.childrenLevel là cấp độ của comment hiện tại (cha)
      commentsArr[startingPoint] là comment tiếp theo sau đó
      Nếu comment tiếp theo có childrenLevel lớn hơn, thì:
      → Nó là comment con (reply) của comment hiện tại → cần xoá

        commentsArr = [
        { _id: A, childrenLevel: 0 },
        { _id: A1, childrenLevel: 1 },
        { _id: A1.1, childrenLevel: 2 },
        { _id: B, childrenLevel: 0 },
      ]

      Giả sử:
      index = 0 (tức là comment A)
      startingPoint = 1 (vị trí comment A1)
      commentData.childrenLevel = 0 (A là comment gốc)

      if (!commentsArr[startingPoint]) { break; }
        Sau khi xoá xong, kiểm tra xem phần tử tại vị trí startingPoint hiện tại còn tồn tại không
        Nếu hết phần tử (chạm cuối mảng) thì commentsArr[startingPoint] === undefined → break (thoát vòng lặp

      commentsArr[1].childrenLevel = 1 > commentData.childrenLevel = 0 → xoá
      splice(1, 1) → xoá A1
      mảng còn: ["A", "A2", "B"]
      A2 dịch lên vị trí 1
      không tăng startingPoint → vẫn tiếp tục kiểm tra commentsArr[1] (chính là A2)
      Nếu bạn tăng startingPoint, bạn sẽ bỏ qua A2 → bug ⚠️

    */
    if (commentsArr[startingPoint]) {
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
    });
  };


  // Reset lại trạng thái
  const hideReplies = () => {

    /*
      | Giá trị                                                                             | Ý nghĩa                                                  |
      | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
      | `index`                                                                             | vị trí của comment hiện tại (comment cha)                |
      | `index + 1`                                                                         | vị trí bắt đầu của các comment con cần kiểm tra và xoá   |
      | `childrenLevel`                                                                     | mức độ "sâu" của comment trong cây reply                 |
      | Dùng `while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel)` | để biết khi nào dừng (gặp comment không phải là con nữa) |
    */
    commentData.isReplyLoaded = false;

    removeCommentsCards(index + 1);
  };

  // =======================================================================================

  // Gọi API để lấy reply và chèn vào commentsArr
  const loadReplies = async ({ skip = 0 }) => {

    /*
      Nếu nhấn lại lần nữa, mà kh xoá replies cũ → thì sẽ:
      bị trùng comment con trong mảng commentsArr
      Hiển thị các reply cũ lặp lại
      Sắp xếp hoặc render sai thứ tự
      Bug UI hoặc hiển thị thừa

      children.length:
      Kiểm tra xem comment này có con không.
      children là mảng chứa _id của các comment con (replies) trong MongoDB (ở server).

      hideReplies();:
      Xoá tạm các replies đã load từ trước (nếu có).
      Tránh bị trùng lặp hoặc "dồn stack" khi load thêm.

      Có 20 replies
      Mỗi lần load tối đa 5 replies (maxLimit = 5 ở server)
      Lần đầu gọi: skip = 0 → lấy 5 replies đầu
      Lần sau gọi: skip = 5 → lấy tiếp từ reply thứ 6 đến 10

    */
    if (children.length) {
      hideReplies();

      try {
        const {
          data: { replies },
        } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-replies",
          { _id, skip }
        );

        commentData.isReplyLoaded = true;     // Gắn flag cho comment này là đã load replies

        for (let i = 0; i < replies.length; i++) {

          /*
            commentData.childrenLevel là level của comment cha (ví dụ: 0 là comment gốc)
            replies[i].childrenLevel = cha + 1 → là cấp độ của reply (con)
            
            Comment cha leftValue = 0
            Reply leftValue = 1
            Cháu leftValue = 2

            =======================================================================
            
            .splice(start, deleteCount, item)
            Chèn phần tử mới item vào vị trí start
            deleteCount = 0 nghĩa là không xoá gì cả

            | Thành phần | Ý nghĩa                                              |
            | ---------- | ---------------------------------------------------- |
            | `index`    | Vị trí của comment cha trong `commentsArr`           |
            | `+ 1`      | Chèn ngay **sau** comment cha                        |
            | `+ i`      | Mỗi reply tiếp theo → chèn thêm một vị trí tiếp theo |
            | `+ skip`   | Đã từng chèn `skip` replies trước đó → tránh chèn đè |

          */
          replies[i].childrenLevel = commentData.childrenLevel + 1;

          commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
        }

        setBlog({
          ...blog,
          comments: { ...comments, results: commentsArr },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  //=================================================================================================

  return (
    <div className="w-full" style={{ paddingLeft: `${leftValue * 10}px` }}>
      <div className="my-4 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{formatDateOnly(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <Button
              onClick={hideReplies}
              className="text-sm flex items-center p-2 px-2 gap-2 rounded-md"
            >
              <CommentIcon className="w-4 h-4" /> Hide Reply
            </Button>
          ) : (
            <Button
              onClick={loadReplies}
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
    </div>
  );
};

export default CommentCard;
