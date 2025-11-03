import axios from "axios";
import hideReplies from "./hideReplies";

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

const loadReplies = async ({
  skip = 0,
  index,
  currentIndex = index,
  commentData,
  commentsArr,
  blog,
  setBlog,
}) => {

  if (commentsArr[currentIndex].children.length) {

    hideReplies({
      index,
      commentData,
      commentsArr,
      blog,
      setBlog,
    });

    try {
      const {
        data: { replies },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/get-replies",
        {
          _id: commentsArr[currentIndex]._id,
          skip,
        }
      );

      commentData.isReplyLoaded = true; // Gắn flag cho comment này là đã load replies

      // console.log(replies);
      
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

      for (let i = 0; i < replies.length; i++) {
        replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;

        commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
      }

      setBlog({
        ...blog,
        comments: { ...blog.comments, results: commentsArr },
      });
    } catch (err) {
      console.error("Failed to load replies:", err);
    }
  }
};

export default loadReplies;
