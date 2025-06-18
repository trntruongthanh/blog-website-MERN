import { useContext, useState } from "react";
import { CrossMallIcon } from "../Icons";
import Button from "./button";
import { EditorContext } from "../pages/editor.pages";
import toast from "react-hot-toast";

const Tag = ({ tag, tagIndex }) => {
  let { blog, setBlog } = useContext(EditorContext);

  let { tags } = blog;

  //========================================================================================

  const handleTagDelete = () => {
    const updatedTags = tags.filter((t) => t !== tag);
    setBlog({ ...blog, tags: updatedTags });
  };

  const handleTagEdit = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      let newTag = event.target.innerText.trim(); //là một phương thức của string dùng để loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi.

      if (!newTag) {
        toast.error("Tag cannot be empty.");
        event.target.innerText = tag; // revert lại
        return;
      }

      // Hàm .some() sẽ duyệt qua toàn bộ mảng tags và trả về true nếu ít nhất 1 phần tử thỏa điều kiện. Có tag nào giống với cái vừa sửa không, Nhưng không phải chính nó (tránh false-positive)
      const isDuplicate = tags.some((currentTag, i) => currentTag === newTag && i !== tagIndex);
      
      if (isDuplicate) {

        toast.error("This tag already exists.");
        event.target.innerText = tag;
        return;
      }

      const updatedTags = [...tags];

      updatedTags[tagIndex] = newTag;

      setBlog({ ...blog, tags: updatedTags });

      event.target.setAttribute("contentEditable", false);
    }
  };

  const addEditable = (event) => {
    event.target.setAttribute("contentEditable", true);
    event.target.focus();
  };

  //==========================================================================================
  return (
    <div className="relative p-1 mt-2 mr-2 px-5 bg-white rounded-full inline-block pr-8">
      <p
        onKeyDown={handleTagEdit}
        onClick={addEditable}
        className="outline-none"
      >
        {tag}
      </p>

      <Button
        onClick={handleTagDelete}
        className="absolute rounded-full right-[1px] top-1/2 -translate-y-1/2"
      >
        <CrossMallIcon className="pointer-events-none" />
      </Button>
    </div>
  );
};

export default Tag;
