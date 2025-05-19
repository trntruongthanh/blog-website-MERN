import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { formatDateOnly, formatJoined, formatTimeAgo } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  tags: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
};

const BlogPage = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
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

      setBlog(blog);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  // =======================================================================================

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
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

        </div>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
