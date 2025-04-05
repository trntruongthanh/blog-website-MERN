import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";

import { uploadImage } from "../common/cloudinary";

import images from "../assets/imgs/images";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor.pages";
import { tools } from "./tools.component";

const BlogEditor = () => {
  const { setEditorState, blog, setBlog, textEditor, setTextEditor } = useContext(EditorContext);

  const { title, banner, content, tags, des } = blog;

  /*
    isReady là một Promise được EditorJS cung cấp để thông báo khi trình soạn thảo đã khởi tạo xong:
    Khi EditorJS hoàn tất việc khởi tạo, Promise này sẽ resolve (hoàn thành). Nếu có lỗi trong quá trình khởi tạo, nó sẽ reject (thất bại).
  */
  useEffect(() => {
    const editorInstance = new EditorJS({
      holder: "textEditor",
      data: "",
      tools: tools,
      placeholder: "Let's write an awesome story",
    });

    setTextEditor(editorInstance);

    console.log(textEditor)
  }, []);

  // ========================================================================================

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (!img) return;

    let loadingToast = toast.loading("Uploading...");

    try {
      const imageUrl = await uploadImage(img);

      toast.dismiss(loadingToast);
      toast.success("Uploaded Successfully! 🎉");

      setBlog({ ...blog, banner: imageUrl });
    } catch (error) {
      console.error("Upload failed:", error);

      toast.dismiss(loadingToast);        // Đảm bảo loading toast biến mất
      toast.error("Upload failed! ❌"); 
    }
  };

  //=======================================================================================

  const handleTitleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  const handleTitleChange = (event) => {
    let input = event.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  //=======================================================================================

  const handleError = (event) => {
    event.target.src = images.blogBanner;
  };

  //========================================================================================

  const handlePublish = async () => {

    // console.log("isReady:", textEditor); 

    if (!banner.length) {
      return toast.error("Upload a blog banner to publish it.");
    }

    if (!title.length) {
      return toast.error("Write blog a title to publish it.");
    }

    try {
      await textEditor.isReady;     // Đảm bảo trình soạn thảo đã sẵn sàng
      const data = await textEditor.save();
  
      if (data.blocks.length) {

        setBlog({ ...blog, content: data });
        setEditorState("publish");
      } else {

        toast.error("Write something in your blog to publish it.");
      }
    } catch (err) {

      console.error("Error:", err);
      toast.error("Editor is not ready yet!");
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link className="flex-none w-10" to="/">
          <img className="w-full" src={images.logo}></img>
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button onClick={handlePublish} className="btn-dark py-2">
            Publish
          </button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>

      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey ">
              <label htmlFor="uploadBanner">
                <img
                  onError={handleError}
                  className="z-20 w-full h-full object-cover"
                  src={banner}
                />

                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              placeholder="Blog Title"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div className="font-gelasio" id="textEditor"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
