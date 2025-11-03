import { useContext } from "react";
import { BlogContext } from "@/pages/blog.page";

import getParentIndex from "@/utils/comment-utils/getParentIndex";

import Button from "@/components/button";
import loadReplies from "@/utils/comment-utils/loadReplies";

const LoadMoreRepliesButton = ({ commentData, index }) => {

  let {
    blog: {
      comments: { results: commentsArr },
    },
    blog,
    setBlog,
  } = useContext(BlogContext);

  // =========================================================================================================

  // Xác định vị trí của comment cha trong danh sách commentsArr
  let parentIndex = getParentIndex(index, commentsArr, commentData);

  /* 
    Tạo sẵn nút "Load More Replies"
    Khi được nhấn → gọi `loadReplies` để tải thêm comment con từ server 

    Giả sử bạn có một comment cha nằm ở vị trí:           
        skip: index - parentIndex,
        urrentIndex: parentIndex,
            parentIndex = 4
            Và hiện tại bạn đang render tới:
            index = 6
            → Vậy bạn đã hiển thị 2 replies (index - parentIndex = 2) → truyền skip = 2 lên server để nói:
            “Tôi đã load 2 replies rồi, hãy cho tôi 5 replies tiếp theo tính từ số 2 trở đi.”
  */

  let buttonLoadMoreReplies = (
    <Button
      onClick={() =>
        loadReplies({
          skip: index - parentIndex,
          index,
          currentIndex: parentIndex,
          commentData,
          commentsArr,
          blog,
          setBlog,
        })
      }
      className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
    >
      Load More Replies
    </Button>
  );

  // =========================================================================================================


  /*
    Đoạn này dùng để quyết định có nên hiển thị nút "Load More Replies" hay không, dựa trên vị trí các comment trong commentsArr.
  
  1. commentsArr[index + 1]: Kiểm tra xem comment sau comment hiện tại (index + 1) có tồn tại hay không.

  2. commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel:  → So sánh childrenLevel của comment kế tiếp với comment hiện tại:
    Nếu kế tiếp có cấp độ thấp hơn, tức là đã ra khỏi nhóm replies hiện tại.

        Ví dụ:
        comment cha có childrenLevel = 0
        reply con có childrenLevel = 1
        nếu kế tiếp có childrenLevel = 0 → tức là đã hết nhóm reply → có thể load thêm

  3. index - parentIndex < commentsArr[parentIndex].children.length:
    Kiểm tra xem đã hiển thị hết replies chưa:
      index - parentIndex = số replies đã hiển thị
      children.length = tổng số replies thực tế của comment cha (trong DB)
      Nếu số đã hiển thị ít hơn tổng số → vẫn còn replies để load thêm ⇒ hiện nút


  commentsArr = [
    { _id: 1, childrenLevel: 0, children: [2, 3, 4] }, // index = 0
    { _id: 2, childrenLevel: 1 }, // index = 1
    { _id: 3, childrenLevel: 1 }, // index = 2
    { _id: 4, childrenLevel: 1 }, // index = 3
    { _id: 5, childrenLevel: 0 }, // index = 4 → comment mới, không phải reply
  ];

    Ở đây:
    index = 3 → comment cuối cùng của nhóm reply
    index + 1 = 4 → comment tiếp theo là childrenLevel = 0
    Vì 0 < 1 → đã ra khỏi nhóm replies
    index - parentIndex = 3 - 0 = 3
    children.length = 3
    → ❌ Không cần hiện "Load More Replies" vì đã load đủ

  else{
    
    → Đây là trường hợp index + 1 không tồn tại, tức là:
    Đây là comment cuối cùng trong danh sách (không có comment tiếp theo)
    Vẫn kiểm tra như trên: nếu chưa load hết replies → hiện nút.
  } 
    
  */

  if (commentsArr[index + 1]) {

    if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel ) {

      if (index - parentIndex < commentsArr[parentIndex].children.length) {

        return buttonLoadMoreReplies;
      }
    }
  } else {

    if (parentIndex !== undefined) {

      if (index - parentIndex < commentsArr[parentIndex].children.length) {

        return buttonLoadMoreReplies;
        
      }
    }
  }

  return null;
};

export default LoadMoreRepliesButton;
