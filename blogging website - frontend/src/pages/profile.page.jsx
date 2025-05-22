import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { UserContext } from "../App";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import AboutUser from "../components/about.component";
import filterPaginationData from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");

  const {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const {
    userAuth: { username },
  } = useContext(UserContext);

  //========================================================================================

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/get-profile",
        { username: profileId }
      );

      if (!user) {
        setLoading(false); // Không tìm thấy user → dừng loading → PageNotFound
        return;
      }

      setProfile(user);

      setProfileLoaded(profileId);

      getBlogs({ user_id: user._id, create_new_arr: true });

      setLoading(false); // <- DỪNG LOADING sau khi tải thành công
    } catch (error) {
      console.log(error);
      setLoading(false); // <- DỪNG LOADING nếu có lỗi khi gọi API
    }
  };

  //===========================================================================================

  /*
    Nó kiểm tra xem tham số user_id có được truyền vào không:
    Nếu user_id bị undefined → tức là gọi getBlogs() mà không truyền user_id mới → sẽ dùng blogs.user_id đã có sẵn từ trước (đã lưu trong state).
    Nếu user_id có giá trị → dùng giá trị được truyền vào đó.
  */

  const getBlogs = async ({ page = 1, user_id, create_new_arr = false }) => {
    try {
      user_id = user_id === undefined ? blogs.user_id : user_id;

      if (!user_id) return;

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { author: user_id, page }
      );

      let formatedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { author: user_id },
        create_new_arr,
      });


      /*
        Ghi lại user_id vào trong object formatedData để có thể dùng lại ở lần gọi sau
        (giống như "ghi nhớ" user đó là ai).

        Vì đoạn đầu của hàm getBlogs có logic sau: user_id = user_id === undefined ? blogs.user_id : user_id;
        Nếu bạn không truyền user_id vào hàm getBlogs (ví dụ khi load thêm trang mới trong pagination),
        Thì nó sẽ lấy user_id từ blogs.user_id (được lưu từ lần gọi trước đó).
        
        ➡️ Để blogs.user_id tồn tại thì bạn phải gán user_id vào formatedData trước khi setBlogs(formatedData).
      */
      formatedData.user_id = user_id;

      setBlogs(formatedData);
    } catch (error) {
      console.log(error);
    }
  };

  /*
    Giải thích từng bước:
    profileId !== profileLoaded:
    Nếu bạn đang truy cập một trang profile mới (VD: từ /user/john chuyển sang /user/jane), thì profileId sẽ khác profileLoaded.
    Bạn xóa dữ liệu blog cũ bằng setBlogs(null) để chuẩn bị fetch mới.
    blogs === null:
    Đây là dấu hiệu để biết cần fetch lại data.
    Khi blogs bị set null, bạn gọi resetStates() và fetchUserProfile().
    Trong fetchUserProfile():


    ✅ 1. Khi profileId thay đổi:
    Điều này xảy ra khi bạn chuyển sang profile khác trên URL, ví dụ:
    Từ /profile/john → /profile/susan
    useParams() sẽ lấy profileId mới.
    Vì profileId !== profileLoaded, dòng setBlogs(null) sẽ chạy → trigger blogs thay đổi → useEffect chạy tiếp lần nữa.

    ✅ 2. Khi blogs bị set lại (setBlogs(null)):
    Sau khi set blogs = null ở bước 1, effect chạy lại lần nữa, và do blogs === null, bạn tiếp tục:
    Gọi resetStates() → reset profile, loading, profileLoaded
    Gọi fetchUserProfile() để lấy dữ liệu mới

    ✅ 3. Khi blog đã được fetch và bạn setBlogs(data):
    Lúc đó, blogs từ null → object → hook không chạy lại nữa, vì blogs và profileId không thay đổi tiếp.

    Dòng if (profileId !== profileLoaded) setBlogs(null) chỉ có tác dụng khi profileId đổi và blogs !== null.
    Nếu blogs đã là null rồi → setBlogs(null) không tạo side effect gì nữa → useEffect sẽ không bị loop vô hạn.

  */

  const resetStates = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  };

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetStates();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  
  /*
    🧠 Đọc theo logic:
    Nếu loading === true → render <Loader />
    → ⏳ Trang đang tải dữ liệu → hiển thị spinner.

    Nếu loading === false, kiểm tiếp:

    Nếu profile_username.length > 0 → render <section>...</section>
    → ✅ Có dữ liệu user → hiển thị trang profile.

    Nếu profile_username.length === 0 → render <PageNotFound />
    → ❌ Không có username (tức là profile không hợp lệ) → hiển thị 404.
  */

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader /> // 🔁 loading === true → hiển thị spinner
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />

            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2">
              {profileId === username ? (
                <Link
                  to="/setting/edit-profile"
                  className="btn-light rounded-md hover:bg-lavender"
                >
                  Edit Profile
                </Link>
              ) : (
                ""
              )}
            </div>

            <AboutUser className="max-md:hidden" dataProfile={profile} />
          </div>

          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              routes={["Blogs Published", "About"]}
              defaultHidden={["About"]}
            >
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

                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} />
              </>

              <AboutUser dataProfile={profile} />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound /> // ✅ loading === false, không có username → 404
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
