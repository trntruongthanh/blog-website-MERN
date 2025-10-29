import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";

import { ArrowUpIcon } from "../Icons";

import Button from "../components/button";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import filterPaginationData from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

import { useTheme } from "@/hooks/useTheme";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);

  const [trendingBlogs, setTrendingBlogs] = useState(null);

  const [pageState, setPageState] = useState("home"); // quản lý tags

  const { theme, setTheme } = useTheme();

  const NAV_ROUTES = [pageState, "trending blogs"];

  const categories = [
    "programming",
    "hollywood",
    "tech",
    "ai",
    "chatgpt",
    "working",
    "travel",
    "hoanghon",
  ];

  //===========================================================================

  const fetchLatestBlogs = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", {
        page,
      });

      // console.log(data.blogs);

      let formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });

      if (!formattedData) {
        throw new Error("Failed to format pagination data");
      }

      // console.log(formattedData);

      setBlogs(formattedData);
    } catch (error) {
      console.error("Error fetching latest blogs:", error);
    }
  };

  //===========================================================================

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs");

      if (!data.blogs) {
        throw new Error("No blogs data received");
      }

      setTrendingBlogs(data.blogs);
    } catch (error) {
      console.error("Error fetching trending blogs:", error);
    }
  };

  //===========================================================================

  const fetchBlogByCategory = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      });

      let formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pageState },
      });

      if (!formattedData) {
        throw new Error("Failed to format category data");
      }

      setBlogs(formattedData);
    } catch (error) {
      console.error("Error fetching blogs by category:", error);
    }
  };

  //===========================================================================
  /*
    Tóm lại luồng lần đầu render:
    trendingBlogs === null → điều kiện !trendingBlogs === true
    Gọi fetchTrendingBlogs() → cập nhật state
    Component re-render → trendingBlogs !== null
    Điều kiện !trendingBlogs trở thành false, không gọi lại API nữa 
  */

  useEffect(() => {
    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  // =====================================================================================

  /*
  - Lấy **tên category** từ nội dung nút mà người dùng vừa bấm (`Button`).
  - `.toLowerCase()` để đảm bảo thống nhất định dạng với `pageState`
    Reset lại blogs về null để hiển thị component <Loader /> trong khi đang fetch data mới.
  
    
  - Nếu người dùng bấm **lại cùng một category đang được chọn**, ví dụ: đang xem `ai` rồi bấm lại `ai`:
  - Thay vì fetch lại, ta quay về trang `home` → gọi lại `fetchLatestBlogs()` (do `useEffect` sẽ chạy lại khi `pageState` đổi thành `"home"`).
  - Tránh việc fetch trùng lặp.

    Nếu chọn một category mới, cập nhật pageState để useEffect biết và gọi fetchBlogByCategory.
  */
  const loadBlogByCategory = (event) => {
    let category = event.target.innerText.toLowerCase(); // Nó là thuộc tính DOM dùng để lấy ra nội dung hiển thị (text) bên trong một phần tử HTML.

    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation  routes={NAV_ROUTES} defaultHidden={["trending blogs"]}>
            {/* latest blogs */}
            {/* → là cú pháp đúng vì:
              blogs là object
              results là key chứa mảng blog
              .length là chiều dài của mảng results */}
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      key={index}
                    >
                      <BlogPostCard data={blog} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFunc={pageState === "home" ? fetchLatestBlogs : fetchBlogByCategory}
              />
            </>

            {/* trending blogs */}
            <>
              {trendingBlogs === null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((trendingBlog, index) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      key={index}
                    >
                      <MinimalBlogPost data={trendingBlog} index={index} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No trending blogs" />
              )}
            </>
          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Stories form all interests</h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, index) => {
                  return (
                    <Button
                      onClick={loadBlogByCategory}
                      key={index}
                      className={clsx(
                        "tag",
                        theme === "dark" && "hover:bg-slate-600",
                        pageState === category && "bg-black text-white"
                      )}
                    >
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* trending Grow up  */}
            <div>
              <h1 className="flex font-medium text-xl mb-8 mt-8">
                Trending <ArrowUpIcon className="ml-1" />{" "}
              </h1>

              <>
                {trendingBlogs === null ? (
                  <Loader />
                ) : trendingBlogs.length ? (
                  trendingBlogs.map((trendingBlog, index) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        key={index}
                      >
                        <MinimalBlogPost data={trendingBlog} index={index} />
                      </AnimationWrapper>
                    );
                  })
                ) : (
                  <NoDataMessage message="No trending blogs" />
                )}
              </>
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
