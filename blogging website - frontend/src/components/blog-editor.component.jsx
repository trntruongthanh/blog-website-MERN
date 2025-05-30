import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";

import { uploadImage } from "../common/cloudinary";

import images from "../assets/imgs/images";
import AnimationWrapper from "../common/page-animation";

import { EditorContext } from "../pages/editor.pages";
import { UserContext } from "../App";
import { tools } from "./tools.component";

const BlogEditor = () => {
  const { setEditorState, blog, setBlog, textEditor, setTextEditor } =
    useContext(EditorContext);

  const { title, banner, content, tags, des } = blog;

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { blog_id } = useParams();

  const navigate = useNavigate();

  //=========================================================================================

  /*
    isReady là một Promise được EditorJS cung cấp để thông báo khi trình soạn thảo đã khởi tạo xong:
    Khi EditorJS hoàn tất việc khởi tạo, Promise này sẽ resolve (hoàn thành). Nếu có lỗi trong quá trình khởi tạo, nó sẽ reject (thất bại).
  */
  useEffect(() => {
    let editorInstance; // Khai báo biến cục bộ để lưu instance của EditorJS

    // Nếu editor chưa tồn tại hoặc chưa sẵn sàng => khởi tạo mới
    if (!textEditor || !textEditor.isReady) {
      editorInstance = new EditorJS({
        holder: "textEditor",                                   // ID của phần tử HTML sẽ chứa editor
        data: Array.isArray(content) ? content[0] : content,    // Dữ liệu hiện tại của blog (dùng cho khi edit lại)
        tools: tools,                                           // Bộ công cụ được cấu hình (Header, List, Quote, v.v...)   
        placeholder: "Let's write an awesome story",
      });

      // Lưu instance mới vào context để dùng sau này
      setTextEditor(editorInstance);
    }

    return () => {

      // Nếu editorInstance tồn tại và có hàm destroy
      if (editorInstance && editorInstance.destroy) {

        // Đợi editor sẵn sàng rồi mới destroy (tránh lỗi)
        editorInstance.isReady
          .then(() => {
            editorInstance.destroy();
          })
          .catch((err) => {
            console.error("Failed to destroy editor:", err);
          });
      }
    };

    // console.log(textEditor)
  }, []);

  // useEffect(() => {
  //   console.log("textEditor trong useEffect:", textEditor);

  //   if (textEditor && textEditor.isReady) {
  //     textEditor.isReady
  //       .then(() => {
  //         console.log("✅ Editor đã sẵn sàng");
  //       })
  //       .catch(() => {
  //         console.log("❌ Editor chưa sẵn sàng");
  //       });
  //   }
  // }, [textEditor]);

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

      toast.dismiss(loadingToast); // Đảm bảo loading toast biến mất
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

    /*
      .save() là một phương thức của EditorJS để lấy nội dung hiện tại mà người dùng đã viết trong trình soạn thảo.
      Nó trả về một Promise chứa object
    */

    try {
      await textEditor.isReady;                   // Đảm bảo trình soạn thảo đã sẵn sàng
      const content = await textEditor.save();   // Lấy nội dung hiện tại từ editor

      if (content.blocks.length) {
        setBlog({ ...blog, content: content });
        setEditorState("publish");
        
      } else {
        toast.error("Write something in your blog to publish it.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Editor is not ready yet!");
    }
  };

  //================================================================================

  const handleSaveDraft = async (event) => {
    if (event.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    const loadingToast = toast.loading("Saving Draft...");
    event.target.classList.add("disable");

    try {
      await textEditor.isReady;
      const content = await textEditor.save();

      const blogObj = {
        title,
        banner,
        des,
        tags,
        content,
        draft: true,
      };

      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      event.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      toast.success("Saved 👌");

      setTimeout(() => {
        navigate("/");
      }, 500);
      
    } catch (error) {
      event.target.classList.remove("disable");
      toast.dismiss(loadingToast);

      return toast.error(
        error.response?.data?.error || "Something went wrong!"
      );
    }
  };

  //=====================================================================================

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

          <button onClick={handleSaveDraft} className="btn-light py-2">
            Save Draft
          </button>
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
              defaultValue={title}
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
