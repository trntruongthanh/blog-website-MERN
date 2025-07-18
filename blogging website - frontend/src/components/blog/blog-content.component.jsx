import Img from "../rendering-content/img";
import List from "../rendering-content/list";
import Quote from "../rendering-content/quote";

/*
  dangerouslySetInnerHTML là một thuộc tính đặc biệt trong React được dùng để nhúng trực tiếp HTML vào một phần tử 
  tương tự như innerHTML trong JavaScript DOM thuần.

  <p>{"<b>Hello</b>"}</p> // ❌ Sẽ render ra chuỗi "<b>Hello</b>" chứ không phải chữ in đậm
  Nếu bạn muốn thực sự render HTML (như thẻ <b>, <i>, <a>...), thì phải dùng:
  <p dangerouslySetInnerHTML={{ __html: "<b>Hello</b>" }} />
*/

const BlogContent = ({ block }) => {
  let { data, type } = block;

  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className="text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h3>
      );
    }
    return (
      <h2
        className="text-4xl font-bold"
        dangerouslySetInnerHTML={{ __html: data.text }}
      ></h2>
    );
  }

  if (type === "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  if (type === "list") {
    return <List items={data.items} style={data.style} />;
  }
};

export default BlogContent;
