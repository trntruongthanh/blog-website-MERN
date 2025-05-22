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
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);

  const [similarBlogs, setSimilarBlogs] = useState(null);

  const [loading, setLoading] = useState(true);

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

      setBlog(blog); // Cập nhật ngay khi fetch được blog

      // Sau đó mới gọi API phụ
      try {
        const {
          data: { blogs },
        } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
          {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
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
  };

  useEffect(() => {
    resetState();

    fetchBlog();
  }, [blog_id]);

  // =======================================================================================

  const value = {
    blog,
    setBlog,
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={value}>
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
