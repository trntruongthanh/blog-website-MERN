import axios from "axios";
import { useEffect, useState } from "react";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";

import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";

const routes = ["home", "trending blogs"];

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);

  //===========================================================================

  const fetchLatestBlogs = async () => {
    try {
      const { data } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs"
      );

      setBlogs(data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  //===========================================================================

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs"
      );

      setTrendingBlogs(data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  //===========================================================================

  useEffect(() => {
    fetchLatestBlogs();
    fetchTrendingBlogs();
  }, []);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation routes={routes} defaultHidden={["trending blogs"]}>
            {/* latest blogs */}
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                blogs.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: index * 1 }}
                      key={index}
                    >
                      <BlogPostCard data={blog} />
                    </AnimationWrapper>
                  );
                })
              )}
            </>

            {/* trending blogs */}
            <>
              {trendingBlogs === null ? (
                <Loader />
              ) : (
                trendingBlogs.map((trendingBlog, index) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: index * 1 }}
                      key={index}
                    >
                      <MinimalBlogPost data={trendingBlog} index={index} />
                    </AnimationWrapper>
                  );
                })
              )}
            </>

          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
