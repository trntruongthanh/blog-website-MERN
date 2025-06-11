import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AnimationWrapper from "../common/page-animation";
import { formatDateOnly, formatTimeAgo } from "../common/date";
import Loader from "../components/loader.component";

import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentContainer from "../components/comments.component";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();  // Lấy blog_id từ URL

  const [blog, setBlog] = useState(blogStructure);   // State lưu blog hiện tại

  const [similarBlogs, setSimilarBlogs] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isLikedByUser, setIsLikedByUser] = useState(false);

  const [commentsWrapper, setCommentsWrapper] = useState(true);

  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
 
  const {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blog;

  // ========================================================================================

  const fetchBlog = async () => {
    try {
      const {
        data: { blog },
      } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
      });

      if (!blog) {
        setLoading(false);
        return;
      }

      console.log(blog.content);
      setBlog(blog); // Cập nhật ngay khi fetch được blog

      /*
        💡 Mục đích
        Tìm những bài blog có cùng tag với blog đang xem (blog hiện tại) và không bao gồm chính blog đó (loại trừ blog hiện tại).

        tag: chỉ định tag cần tìm blog tương tự.
        limit: giới hạn số lượng blog trả về (ở đây là 6).
        eliminate_blog: truyền blog_id hiện tại để loại bỏ nó khỏi danh sách blog tương tự (nếu không làm điều này thì nó có thể tự hiện lại trong danh sách).
      */
      try {
        const {
          data: { blogs },
        } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
          {
            tag: blog.tags[0],          // Lọc theo tag đầu tiên của blog hiện tại
            limit: 6,                   // Giới hạn kết quả tối đa là 6 blog
            eliminate_blog: blog_id,    // Không lấy chính blog hiện tại
          }
        );

        setSimilarBlogs(blogs);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setIsLikedByUser(false);
    // setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  useEffect(() => {
    resetState();

    fetchBlog();
  }, [blog_id]);

  // =======================================================================================

  const value = {
    blog,
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    commentsWrapper,
    setCommentsWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={value}>
          
          <CommentContainer />

          <div className="max-w-[900px] center py-10 max-lg:px-[-5vw]">
            <img src={banner} className="aspect-video" />

            <div className="mt-12">
              <h2>{title}</h2>

              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img className="w-12 h-12 rounded-full" src={profile_img} />

                  <p>
                    {fullname}
                    <br /> @
                    <Link className="underline" to={`/user/${author_username}`}>
                      {author_username}
                    </Link>
                  </p>
                </div>

                <p className="max-sm:mt-6">
                  <Tippy
                    theme="custom"
                    duration={[250, 150]}
                    content={formatTimeAgo(publishedAt)}
                  >
                    <span className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                      Publish on {formatDateOnly(publishedAt)}
                    </span>
                  </Tippy>
                </p>
              </div>
            </div>

            <BlogInteraction />

            {/* Blog Content will go over here */}
            <div className="my-12 font-gelasio blog-page-content">
              {content[0].blocks.map((block, index) => {
                return (
                  <div key={index} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteraction />

            {similarBlogs !== null && similarBlogs.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>
                {similarBlogs.map((blog, index) => {
                  let {
                    author: { personal_info },
                  } = blog;

                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <BlogPostCard data={blog} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              ""
            )}
          </div>

        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
