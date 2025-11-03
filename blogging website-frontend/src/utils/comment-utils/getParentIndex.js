/*
    Tìm vị trí (index) của comment cha gần nhất trong mảng commentsArr, dựa trên childrenLevel.
    | Mục tiêu                          | Hành động                                          |
    | --------------------------------- | -------------------------------------------------- |
    | Tìm comment cha gần nhất          | Lùi về từng phần tử trước đó                       |
    | So sánh `childrenLevel`           | Nếu `>=` → tiếp tục lùi lại (vì nó không phải cha) |
    | Nếu `<` → tìm thấy cha            | Dừng vòng lặp và trả về index                      |
    | Nếu lùi ra ngoài mảng (index < 0) | Bị lỗi → vào `catch` → trả về `undefined`          |
  
  */
const getParentIndex = (index, commentsArr, commentData) => {
  let startingPoint = index - 1;

  while (startingPoint >= 0 && commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
    startingPoint--;
  }

  // Nếu không tìm thấy cha (ví dụ comment ở đầu mảng hoặc lỗi dữ liệu)
  return startingPoint >= 0 ? startingPoint : undefined;
};

export default getParentIndex;