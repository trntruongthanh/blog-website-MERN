import axios from "axios";
import { useEffect, useState } from "react";
import { data, useParams } from "react-router-dom";

import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";

import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import filterPaginationData from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

import UserCardWrapper from "../components/usercard-wrapper.component";
import { UserIcon } from "../Icons";

const SearchPage = () => {
  let { query } = useParams();

  let [blogs, setBlogs] = useState(null);

  let [users, setUsers] = useState(null);

  let route = [`Search Results from "${query}"`, "Accounts Matched"];

  // ====================================================================================

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { query, page }
      );

      let formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { query },
        create_new_arr,
      });

      if (!formattedData) {
        throw new Error("Failed to format pagination data");
      }

      // console.log(formattedData);

      setBlogs(formattedData);
    } catch (error) {
      console.error("Error fetching search blogs:", error);
    }
  };

  //==================================================================================

  const fetchUsers = async () => {
    try {
      // console.log("Query gửi đi:", query);

      const {
        data: { users },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-users",
        { query }
      );

      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!query) return;

    resetState();

    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  //==========================================================================================

  // const UserCardWrapper = () => {
  //   return (
  //     <>
  //       {users === null ? (
  //         <Loader />
  //       ) : users.length ? (
  //         users.map((user, index) => {
  //           return (
  //             <h1 key={index}>
  //               <UserCard data={user} />
  //             </h1>
  //           );
  //         })
  //       ) : (
  //         <NoDataMessage message="No user found" />
  //       )}
  //     </>
  //   );
  // };

  //==========================================================================================

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation routes={route} defaultHidden={["Accounts Matched"]}>
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

            <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs} />
          </>

          <UserCardWrapper data={users} />
        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium tex-xl mb-8 flex gap-2">
          User related to search <UserIcon />{" "}
        </h1>
        <UserCardWrapper data={users} />
      </div>
      
    </section>
  );
};

export default SearchPage;
