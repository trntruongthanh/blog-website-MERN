import getParentIndex from "./getParentIndex";

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

const removeCommentsCards = ({
  index,
  commentData,
  commentsArr,
  blog,
  setBlog,
  setTotalParentCommentsLoaded,
  isDelete = false,
}) => {

  const { childrenLevel, _id } = commentData;

  const activity = blog.activity;
  
  const total_parent_comments = activity.total_parent_comments;

  /*
    So sánh comment tại startingPoint với comment hiện tại (commentData)
    Gặp comment không phải là reply nữa ( childrenLevel <= ) Hoặc hết mảng
  */

  let startingPoint = index;

  while (commentsArr[index] && commentsArr[index].childrenLevel > childrenLevel ) {
    
    commentsArr.splice(index, 1);

    if (!commentsArr[startingPoint]) {
      break;
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
    const parentIndex = getParentIndex(index, commentsArr, commentData);

    if (parentIndex !== undefined) {
      commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter((childId) => childId !== _id);

      if (commentsArr[parentIndex].children.length) {
        commentsArr[parentIndex].isReplyLoaded = false;
      }
    }

    commentsArr.splice(index, 1);

    if (childrenLevel === 0 && setTotalParentCommentsLoaded) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }
  }

  setBlog({
    ...blog,
    comments: { ...blog.comments, results: commentsArr },
    activity: {
      ...activity,
      total_comments: activity.total_comments - 1,
      total_parent_comments:
        total_parent_comments - (childrenLevel === 0 && isDelete ? 1 : 0),
    },
  });
};

export default removeCommentsCards;
