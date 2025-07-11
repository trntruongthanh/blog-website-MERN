import toast from "react-hot-toast";
import { useContext, useState, useEffect, useRef } from "react";

import { UserContext } from "../App";

import { formatDateOnly } from "../common/date";
import Button from "./button";
import CommentField from "./comment-field.component";
import { CommentIcon, TrashIcon } from "../Icons";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

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

  // ================================================================================================================================================

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

  // ================================================================================================================================================

  /*
    Tìm vị trí (index) của comment cha gần nhất trong mảng commentsArr, dựa trên childrenLevel.
    | Mục tiêu                          | Hành động                                          |
    | --------------------------------- | -------------------------------------------------- |
    | Tìm comment cha gần nhất          | Lùi về từng phần tử trước đó                       |
    | So sánh `childrenLevel`           | Nếu `>=` → tiếp tục lùi lại (vì nó không phải cha) |
    | Nếu `<` → tìm thấy cha            | Dừng vòng lặp và trả về index                      |
    | Nếu lùi ra ngoài mảng (index < 0) | Bị lỗi → vào `catch` → trả về `undefined`          |
  
  */
  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }

    return startingPoint;
  };

  // ================================================================================================================================================

  /*
  Xóa các reply con khi hide
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


      | Tiêu chí                   | Đoạn 1 – Xoá các comment con reply           | Đoạn 2 – Xoá chính comment hiện tại (nếu isDelete) |
      | -------------------------- | -------------------------------------------- | -------------------------------------------------- |
      | Mục đích                   | Xoá **các reply cấp dưới** (cháu, chắt...)   | Xoá **chính comment đang được xoá**                |
      | Dùng khi nào               | Khi `hideReplies()` hoặc `isDelete === true` | Chỉ khi `isDelete === true`                        |
      | Duyệt nhiều comment không? | ✅ Có, xoá theo `while`                       | ❌ Không, chỉ `splice(index, 1)`                    |
      | Cập nhật cha               | ❌ Không xử lý comment cha                    | ✅ Có cập nhật `children[]` và `isReplyLoaded`      |
      | Thứ tự gọi                 | Chạy TRƯỚC đoạn 2 (nếu isDelete)             | Gọi SAU để xoá chính comment                       |
      
      | Tình huống      | Đoạn nào chạy?                | Diễn giải                                                                  |
      | --------------- | ----------------------------- | -------------------------------------------------------------------------- |
      | Ẩn replies      | Chạy **chỉ đoạn 1**           | Xoá replies khỏi UI tạm thời                                               |
      | Xoá comment con | Chạy đoạn 2 (isDelete = true) | Xoá chính nó, cập nhật `children[]` của cha                                |
      | Xoá comment cha | Chạy đoạn 1 ➝ rồi đoạn 2      | Đoạn 1: xoá các con, đoạn 2: xoá chính cha và cập nhật cha cấp trên nếu có |
  */
  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      /*
          So sánh comment tại startingPoint với comment hiện tại (commentData)
          Gặp comment không phải là reply nữa ( childrenLevel <= ) Hoặc hết mảng
      */
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    /*
      Kiểm tra xem đây có phải là thao tác xoá comment (thật sự) hay không.
      Nếu là true, tiến hành các bước xử lý xoá (chứ không chỉ "ẩn reply").
      Chỉ xử lý chính comment hiện tại đang bị xoá
      Dùng chỉ khi thật sự xoá (isDelete = true)

      Tìm cha của comment này (nếu có)
      Qua getParentIndex()
      Cập nhật cha:
      Xoá _id của comment hiện tại ra khỏi children[] của cha
      Reset lại isReplyLoaded = false để khi load lại sẽ fetch đúng
      Xoá chính comment hiện tại khỏi commentsArr
    */
    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter((child) => child !== _id);

        if (commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_comments: activity.total_comments - 1,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  /*
    Reset lại trạng thái
      | Giá trị                                                                             | Ý nghĩa                                                  |
      | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
      | `index`                                                                             | vị trí của comment hiện tại (comment cha)                |
      | `index + 1`                                                                         | vị trí bắt đầu của các comment con cần kiểm tra và xoá   |
      | `childrenLevel`                                                                     | mức độ "sâu" của comment trong cây reply                 |
      | Dùng `while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel)` | để biết khi nào dừng (gặp comment không phải là con nữa) |
  */
  const hideReplies = () => {
    commentData.isReplyLoaded = false;

    removeCommentsCards(index + 1);
  };

  // ================================================================================================================================================

  // Gọi API để lấy reply và chèn vào commentsArr
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
  const loadReplies = async ({ skip = 0 }) => {
    if (children.length) {
      hideReplies();

      try {
        const {
          data: { replies },
        } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-replies",
          { _id, skip }
        );

        commentData.isReplyLoaded = true; // Gắn flag cho comment này là đã load replies

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

  // ================================================================================================================================================

  const deleteComment = async (event) => {
    const btn = event.currentTarget;
    btn.setAttribute("disabled", true); // Ngăn spam click

    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      removeCommentsCards(index + 1, true); // Gọi hàm xoá ở frontend (isDelete = true
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
              onClick={hideReplies}
              className="text-sm flex items-center p-2 px-2 gap-2 rounded-md"
            >
              <CommentIcon className="w-4 h-4" /> Hide
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

          {username === commented_by_username || username === blog_author ? (
            <Button
              onClick={deleteComment}
              className="p-2 px-2 rounded-md ml-auto hover:bg-red/30 hover:text-red flex items-center"
            >
              <TrashIcon className="w-4 h-4 pointer-events-none" />
            </Button>
          ) : (
            ""
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
