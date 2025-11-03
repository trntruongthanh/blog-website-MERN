import clsx from "clsx";
import axios from "axios";
import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { UserContext } from "@/App";
import Button from "@/components/button";

/**
 * NotificationCommentField
 * - Form nhỏ để trả lời (reply) ngay trong thẻ notification.
 * - Props:
 *    - blog_id: id blog để API biết đang comment cho bài nào
 *    - blog_author: object tác giả blog (để backend biết chủ blog là ai)
 *    - index: vị trí của notification trong mảng notifications.results (để update nhanh)
 *    - replyingTo: id comment đang được reply (nếu là reply con)
 *    - replyingToName: tên người đang được reply (hiển thị placeholder)
 *    - setIsReplying: đóng/mở form khi gửi xong
 *    - notification_id: id của notification gốc (để backend liên kết)
 *    - notificationData: { notifications, setNotifications } state & setter ở cha
 */
const NotificationCommentField = ({
  blog_id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  replyingToName,
  setIsReplying,
  notification_id,
  notificationData,
}) => {

  // Lấy thông tin user hiện tại từ context để gắn vào reply ngay (optimistic UI)
  const {
    userAuth: { access_token },
  } = useContext(UserContext);
  

  // Bóc tách state notifications từ props notificationData (có thể null/undefined)
  const {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData || {};


  // Lấy _id tác giả blog (backend dùng để tạo notification, quyền, v.v.)
  const user_id = blog_author; // vì nó đã là string id rồi


  // State local: nội dung comment & loading khi gọi API
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);


  /*
    Làm sạch input & boolean kiểm tra:
      - trimmed: bỏ khoảng trắng đầu/cuối
      - hasComment: true nếu người dùng thực sự nhập (không chỉ spaces)
  
    1. const trimmed = comment.trim();
    .trim() loại bỏ khoảng trắng đầu và cuối chuỗi.
    Ví dụ:
    " hello " → "hello"
    " " → "" (chuỗi rỗng)
    Mục đích: kiểm tra người dùng có thực sự nhập nội dung hay chỉ gõ toàn dấu cách.

    2. const hasComment = !!trimmed;
    !! ép giá trị về boolean.
    Nếu trimmed = "hello" → true
    Nếu trimmed = "" → false
    Mục đích: dùng hasComment để disable nút “Reply” khi ô nhập trống hoặc chỉ chứa dấu cách.
  
  */
  const trimmed = comment.trim();
  const hasComment = !!trimmed;

  //==========================================================================================================

  // Gửi comment / reply
  const handleComment = async () => {
    if (!access_token) {
      return toast.error("Login first to leave a comment !");
    }


    // Ô trống/chỉ dấu cách
    if (!hasComment) {
      return toast.error("Write something to leave a comment...");
    }


    try {
      setLoading(true);

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id: blog_id,
          comment: trimmed,
          blog_author: user_id,
          replying_to: replyingTo,
          notification_id,          // <- chính là _id notification gốc
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      console.log(data);

      // Đóng form + reset ô nhập
      setIsReplying(false);
      setComment("");

      const enrichedReply = {
        _id: data._id,
        comment: trimmed,

        // CỜ CỤC BỘ: cho phép hiện nút Delete ngay
        mine: true,
      };

      // results[index].reply = { comment, _id: data._id };
      // setNotifications({...notifications, results});

      // Cập nhật đúng phần tử notification ở vị trí index
      setNotifications((prev) => {

        // Sao chép mảng để không mutate
        let results = [...prev.results];

        // Gắn trường reply cho notification đang được trả lời
        results[index] = { ...results[index], reply: enrichedReply };

        // Trả về object notifications mới
        return { ...prev, results };
      });

      toast.success("Replied!");

    } catch (error) {

      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  //==========================================================================================================

  return (
    <>
      <Toaster />

      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder={`Reply to ${replyingToName || "the comment"}... `}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
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
        disabled={!hasComment || loading}
        className={clsx(
          "mt-2 mb-4 border border-lavender bg-white text-black px-4 py-2 rounded-md",
          {
            "btn-shadow hover:bg-gray-200": hasComment && !loading,
            "opacity-60 cursor-not-allowed": loading,
          }
        )}
      >
        Reply
      </Button>
    </>
  );
};

export default NotificationCommentField;
