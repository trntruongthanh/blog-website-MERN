import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import React, { useContext, useEffect, useMemo, useState } from "react";

import useDebounce from "@/hooks/useDebounce";

import { UserContext } from "@/App";

import Loader from "@/components/loader.component";

import filterPaginationData from "@/common/filter-pagination-data";
import NoDataMessage from "@/components/nodata.component";
import AnimationWrapper from "@/common/page-animation";
import InPageNavigation from "@/components/inpage-navigation.component";

import {
  ManagePublishedBlogCard,
  ManageDraftBlogCard,
} from "@/components/manage-blogs-dashboard/manage-blogcard.component";
import LoadMoreDataBtn from "@/components/load-more.component";
import { useSearchParams } from "react-router-dom";

const ManageBlogsSidebar = () => {
  const NAV_ROUTES = useMemo(() => ["Published Blogs", "Drafts"], []);

  const [searchParams] = useSearchParams();
  const activeIndex = searchParams.get("tab") === "draft" ? 1 : 0; // 0 = Published, 1 = Drafts

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  const [isSearching, setIsSearching] = useState(false);

  const debounceQuery = useDebounce(query, 1000);

  //==============================================================================================================

  const getBlogs = async ({ page, draft, deleteDocCount = 0, queryArg = undefined }) => {
    if (!access_token) {
      console.warn("Missing access_token");
      return;
    }

    /* dòng code này đảm bảo dù client gửi draft dưới dạng string hay boolean hay số thì bạn vẫn nhận được kết quả true/false rõ ràng trong draftBool */
    const draftBool = typeof draft === "string" ? draft === "true" : !!draft;

    const effectiveQuery = typeof queryArg === "string" ? queryArg : debounceQuery;

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
        {
          page,
          draft: draftBool,
          query: effectiveQuery,
          deleteDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      /*
        page === 1 → reset list (không append).
        page > 1 → append vào state hiện có.
        Chọn drafts hay blogs tùy loại dữ liệu.
      */
      const formattedData = await filterPaginationData({
        state: page === 1 ? null : draftBool ? drafts : blogs,
        data: data?.blogs,
        page,
        countRoute: "/user-written-blogs-count",
        userAccessToken: access_token,
        data_to_send: { draft: draftBool, query: effectiveQuery },
      });

      // console.log("draft -> ", draftBool, formattedData);
      // console.log("blogs -> ", formattedData);

      if (draftBool) {
        setDrafts(formattedData);
      } else {
        setBlogs(formattedData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ============================================================================================================

  /*
    Tổng kết
    Effect 1 (initial): kiểm tra blogs === null || drafts === null → tránh gọi API thừa.
    Effect 2 (search): không kiểm tra null → vì muốn gọi API bất cứ khi nào debounceQuery đổi, ngay cả khi state đã có data.
  
    draft: false → lấy danh sách blogs đã publish (công khai).
    draft: true → lấy danh sách blogs đang ở trạng thái draft (chưa publish).
  
  */

  // load lần đầu
  useEffect(() => {
    if (!access_token) return;

    const run = async () => {
      try {
        await getBlogs({ page: 1, draft: false });
        await getBlogs({ page: 1, draft: true });
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (blogs === null || drafts === null) run();
  }, [access_token]);

  // search (khi debounceQuery đổi)
  useEffect(() => {
    if (!access_token) return;

    const run = async () => {
      setIsSearching(true);

      try {
        await getBlogs({ page: 1, draft: false });
        await getBlogs({ page: 1, draft: true });
      } finally {
        setIsSearching(false);
      }
    };

    run();
  }, [debounceQuery]);

  //=================================================================================================

  const handleChange = (event) => {
    if (!event.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    } else {
      setQuery(event.target.value);
    }
  };

  // Chỉ dùng debounce cho fetch; Enter chỉ trim input
  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && query.trim().length) {
      setQuery(query.trim());
    }
  };

  //=================================================================================================

  return (
    <>
      <h1 className="max-md:hidden md:mt-8">Manage Blogs</h1>

      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleSearchKeyDown}
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          type="text"
          placeholder="Search Blogs"
        />

        {/* Icon kính lúp bên trái */}
        <i className="fi fi-rr-search absolute right-[10%] md:left-5 md:pointer-events-none top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>

        {/* Bên phải: spinner hiển thị khi isSearching; xong sẽ tự mất */}
        <span className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
          {isSearching ? (
            <span className="inline-block h-5 w-5 rounded-full border-2 border-current border-r-transparent animate-spin align-[-0.125em]" />
          ) : null}
        </span>
      </div>
          
      {/* ép remount khi tab trên URL đổi */}
      <InPageNavigation
        key={`tabs-${activeIndex}`}
        defaultActiveIndex={activeIndex}
        routes={NAV_ROUTES}
        autoSnapOnDesktop={false}
      >
        {
          // Published Blogs tab
          blogs === null ? (
            <Loader />
          ) : blogs.results.length ? (
            <>
              {blogs.results.map((blog, index) => {
                return (
                  <AnimationWrapper key={index} transition={{ delay: index * 0.3 }}>
                    <ManagePublishedBlogCard
                      blog={blog}
                      index={index}
                      setBlogs={setBlogs}
                      onEmpty={() => getBlogs({ page: 1, draft: false, queryArg: query })}
                    />
                  </AnimationWrapper>
                );
              })}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFunc={getBlogs}
                additionalParam={{
                  draft: false,
                  deleteDocCount: blogs.deleteDocCount,
                  queryArg: query,
                }}
              />
            </>
          ) : (
            <NoDataMessage message={"No published blogs"} />
          )
        }

        {
          // Drafts tab
          drafts === null ? (
            <Loader />
          ) : drafts.results.length ? (
            <>
              {drafts.results.map((draft, index) => {
                return (
                  <AnimationWrapper key={index} transition={{ delay: index * 0.3 }}>
                    <ManageDraftBlogCard
                      blog={draft}
                      index={index + 1}
                      setDrafts={setDrafts}
                      onEmpty={() => getBlogs({ page: 1, draft: true, queryArg: query })}
                    />
                  </AnimationWrapper>
                );
              })}

              <LoadMoreDataBtn
                state={drafts}
                fetchDataFunc={getBlogs}
                additionalParam={{
                  draft: true,
                  deleteDocCount: drafts.deleteDocCount,
                }}
              />
            </>
          ) : (
            <NoDataMessage message={"No draft blogs"} />
          )
        }
      </InPageNavigation>
    </>
  );
};

export default ManageBlogsSidebar;
