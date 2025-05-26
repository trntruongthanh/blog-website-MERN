/*
  Nếu style === "ordered" → list-decimal → hiển thị số thứ tự.
  Ngược lại → list-disc → hiển thị dấu chấm (bullet).

  | Thẻ HTML | Ý nghĩa                | Dạng hiển thị |
  | -------- | ---------------------- | ------------- |
  | `<ol>`   | Danh sách có thứ tự    | 1, 2, 3,...   |
  | `<ul>`   | Danh sách không thứ tự | •, ○, –       |

  Nếu style === "ordered" → dùng <ol>.
  Nếu không → dùng <ul>.
*/
const List = ({ items, style }) => {
  const Tag = style === "ordered" ? "ol" : "ul";

  return (
    <Tag
      className={`pl-5 ${style === "ordered" ? "list-decimal" : "list-disc"}`}
    >
      {items.map((listItem, index) => (
        <li
          key={index}
          className="my-4"
          dangerouslySetInnerHTML={{ __html: listItem.content }}
        />
      ))}
    </Tag>
  );
};

export default List;
