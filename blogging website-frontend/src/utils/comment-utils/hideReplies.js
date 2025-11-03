import removeCommentsCards from "./removeCommentsCards";


/*
    Reset lại trạng thái
      | Giá trị                                                                             | Ý nghĩa                                                  |
      | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
      | `index`                                                                             | vị trí của comment hiện tại (comment cha)                |
      | `index + 1`                                                                         | vị trí bắt đầu của các comment con cần kiểm tra và xoá   |
      | `childrenLevel`                                                                     | mức độ "sâu" của comment trong cây reply                 |
      | Dùng `while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel)` | để biết khi nào dừng (gặp comment không phải là con nữa) |
  */

const hideReplies = ({ index, commentData, commentsArr, blog, setBlog }) => {
  commentData.isReplyLoaded = false;

  removeCommentsCards({
    index: index + 1,
    commentData,
    commentsArr,
    blog,
    setBlog,
    isDelete: false,
  });
};

export default hideReplies;
