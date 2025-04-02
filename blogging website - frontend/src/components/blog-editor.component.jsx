import { Link } from "react-router-dom";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

import { uploadImage } from "../common/cloudinary";

import images from "../assets/imgs/images";
import AnimationWrapper from "../common/page-animation";

const BlogEditor = () => {
  const [bannerUrl, setBannerUrl] = useState(null);

  const handleBannerUpload = async (e) => {
    let img = e.target.files[0];

    if (!img) return;

    let loadingToast = toast.loading("Uploading...");

    try {
      const imageUrl = await uploadImage(img);

      setBannerUrl(imageUrl); // Lưu URL ảnh sau khi upload thành công

      toast.dismiss(loadingToast);
      toast.success("Uploaded Successfully! 🎉");
    } catch (error) {
      console.error("Upload failed:", error);

      toast.dismiss(loadingToast); // Đảm bảo loading toast biến mất
      toast.error("Upload failed! ❌"); // Hiển thị lỗi
    }
  };

  const handleTitleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  };

  const handleTitleChange = (event) => {
    let input = event.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  };

  return (
    <>
      <nav className="navbar">
        <Link className="flex-none w-10" to="/">
          <img className="w-full" src={images.logo}></img>
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">New Blog</p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2">Publish</button>
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
                  className="z-20 w-full h-full object-cover"
                  src={bannerUrl || images.blogBanner}
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
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-red"
              placeholder="Blog Title"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
