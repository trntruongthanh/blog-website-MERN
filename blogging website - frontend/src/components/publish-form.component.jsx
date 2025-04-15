import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import { UserContext } from "../App";

import { CrossMallIcon } from "../Icons";
import AnimationWrapper from "../common/page-animation";
import Button from "./Button";
import images from "../assets/imgs/images";
import Tag from "./tags.component";

const PublishForm = () => {
  const characterLimit = 200;

  const tagLimit = 10;
  const { setEditorState, blog, setBlog } = useContext(EditorContext);
  const { banner, title, tags, des, content } = blog;

  const { userAuth } = useContext(UserContext);
  const { access_token } = userAuth;

  const navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  //===============================================================================

  const handleBlogTitleChange = (event) => {
    let input = event.target;

    setBlog({ ...blog, title: input.value });
  };

  //===============================================================================

  const handleDesChange = (event) => {
    let input = event.target;

    setBlog({ ...blog, des: input.value });
  };

  //=====================================================================================

  const handleTitleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  //===============================================================================

  const handleKeyDown = async (event) => {
    // console.log(event.keyCode);

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      let tag = event.target.value;

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags.`);
      }

      event.target.value = "";
    }
  };

  //=====================================================================================
  
  const publishBlog = async (event) => {
    if (event.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }

    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `Write a description of your blog writing ${characterLimit} character to publish`
      );
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your blog");
    }

    const loadingToast = toast.loading("Publishing...");
    
    event.target.classList.add("disable");

    const blogObj = {
      title,
      banner,
      des,
      tags,
      content,
      draft: false,
    };

    /*
      "Bearer" là một dạng của HTTP Authorization header. Nó báo cho server biết rằng: "Tôi đang gửi token ở đây để chứng minh tôi đã đăng nhập." 
      Bearer	Loại token xác thực đang dùng
      */
    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
        blogObj,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      event.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      toast.success("Published😊");

      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error) {
      event.target.classList.remove("disable");
      toast.dismiss(loadingToast);

      // Đây là cách truy cập an toàn (?.) vào lỗi trả về từ server (nếu có).
      return toast.error(
        error.response?.data?.error || "Something went wrong!"
      );
    }
  };

  //=====================================================================================

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />

        <Button
          onClick={handleCloseEvent}
          className="p-1 rounded-full absolute z-10 right-[4vw] top-[5%] lg:top-[10%]"
        >
          <CrossMallIcon />
        </Button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img className="" src={banner || images.blogBanner} />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <input
            onChange={handleBlogTitleChange}
            className="input-box pl-4 "
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
          />

          <p className="text-dark-grey mb-2 mt-9 ">
            Short Description about your post
          </p>

          <textarea
            onChange={handleDesChange}
            onKeyDown={handleTitleKeyDown}
            className="resize-none leading-7 h-40 input-box"
            maxLength={characterLimit}
            defaultValue={des}
          ></textarea>

          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLimit - des.length} character left
          </p>

          <p className="mt-4">
            Topic - (Helps is searching and ranking your blog post)
          </p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              onKeyDown={handleKeyDown}
              type="text"
              className="sticky input-box top-0 left-0 pl-4 mb-3 bg-white focus:bg-white"
              placeholder="Topic"
            />

            {tags.map((tag, index) => {
              return <Tag tag={tag} key={index} tagIndex={index} />;
            })}
          </div>

          <p className="mt-1 mb-4 text-dark-grey text-sm text-right">
            {tagLimit - tags.length} tags left
          </p>

          <Button onClick={publishBlog} className="btn-dark px-8">
            Publish
          </Button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
