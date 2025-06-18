import axios from "axios";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  let res; // Biến lưu kết quả cuối cùng (trả về)

  try {
    // Gửi request tới API backend để lấy comment theo blog_id và skip
    const { data } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments",
      {
        blog_id,
        skip,
      }
    );

    // console.log("Fetched comments:", data);

    // Lấy mảng comment từ response. Nếu không tồn tại, dùng mảng rỗng để tránh lỗi.
    const comments = data.comment || []; // đảm bảo là mảng

    /*
    Duyệt qua từng comment và thêm thuộc tính childrenLevel = 0.
    Đây là logic frontend để xác định comment này là cấp 0 (tức là comment cha, không phải reply). 
    */
    comments.forEach((comment) => {
      comment.childrenLevel = 0;
    });

    /*
      Cập nhật số lượng comment cha đã load bằng cách tăng preVal (giá trị hiện tại) thêm comments.length (số lượng comment vừa fetch được).
      Lưu ý: nên dùng `comments.length` thay vì `data.length` cho chính xác
    */
    setParentCommentCountFun((preVal) => preVal + comments.length);

    /*
      Nếu comment_array là null (tức là lần đầu load),
      thì chỉ trả về mảng comments mới fetch.

      Nếu đã có sẵn comment_array (tức là đang load thêm),
      thì gộp comment mới vào mảng cũ để tạo danh sách đầy đủ.
    */
    if (comment_array === null) {
      res = { results: comments };
    } else {
      res = { results: [...comment_array, ...comments] };
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

export default fetchComments;
