import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { formatDateOnly } from "@/common/date";
import Button from "../button";
import BlogStats from "./blog-stats";
import { UserContext } from "@/App";
import axios from "axios";

export const ManagePublishedBlogCard = ({ blog, index, setBlogs, onEmpty }) => {
  const { banner, blog_id, title, publishedAt, activity } = blog;

  const [showStat, setShowStat] = useState(false);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  // =========================================================================================================

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img
          src={banner}
          className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover rounded-lg"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link className="blog-title mb-4 hover:underline" to={`/blog/${blog_id}`}>
              {title}
            </Link>

            <p className="line-clamp-1 text-dark-grey">
              Published on {formatDateOnly(publishedAt)}
            </p>
          </div>

          <div className="flex gap-8 mt-3">
            <Link
              className="text-dark-grey font-normal btn-light py-2 px-4 hover:bg-lavender"
              to={`/editor/${blog_id}`}
            >
              Edit
            </Link>

            <Button
              onClick={() => setShowStat((prev) => !prev)}
              className="text-dark-grey font-normal lg:hidden py-2 px-4 btn-light hover:bg-lavender"
            >
              Stats
            </Button>

            {/* flex + ml-auto: trong một container flex, nếu một item có margin-left: auto, nó sẽ chiếm toàn bộ không gian trống bên trái và tự động đẩy sát về phía end (bên phải). */}
            <Button
              onClick={(event) =>
                deleteBlog({
                  blog_id,
                  access_token,
                  setStateFunction: setBlogs,
                  target: event.currentTarget,
                  onEmpty,
                })
              }
              className="text-red hover:bg-red/10 py-2 px-4 rounded-full"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>

      {showStat ? (
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

// ==============================================================================================================

export const ManageDraftBlogCard = ({ blog, index, setDrafts, onEmpty }) => {
  const { des, blog_id, title } = blog;

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey ">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? "0" + index : index}
      </h1>

      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-1 text-dark-grey font-normal">
          {des.length ? des : "No description"}
        </p>

        <div className="flex gap-6 mt-3">
          <Link
            className="text-dark-grey font-normal btn-light py-2 px-4 hover:bg-lavender"
            to={`/editor/${blog_id}`}
          >
            Edit
          </Link>

          {/* flex + ml-auto: trong một container flex, nếu một item có margin-left: auto, nó sẽ chiếm toàn bộ không gian trống bên trái và tự động đẩy sát về phía end (bên phải). */}
          <Button
            onClick={(event) =>
              deleteBlog({
                blog_id,
                access_token,
                setStateFunction: setDrafts,
                target: event.currentTarget,
                onEmpty,
              })
            }
            className="text-red hover:bg-red/10 py-2 px-4 rounded-full"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================================================

export const deleteBlog = async ({ blog_id, access_token, setStateFunction, target, onEmpty }) => {

  // Disable nút "Delete" ngay khi bấm (tránh user spam click nhiều lần)
  target.setAttribute("disabled", "true");

  try {
    await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
      { blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let shouldRefetch = false;

    // Nếu API thành công → cập nhật lại state (UI)
    setStateFunction((prev) => {

      // Nếu state chưa có gì (null) → trả về như cũ
      if (!prev) return prev;

      /*
        ?? chỉ coi null và undefined là “nullish”.

        1. Tạo mảng blog mới sau khi loại bỏ blog vừa xóa
        
        2. Giảm tổng số document đi 1 (nhưng không để âm)
        Nếu prev.totalDocs có giá trị (ví dụ 5) → lấy 5 - 1 = 4.
        Nếu prev.totalDocs là null hoặc undefined → thay bằng 0 - 1 = -1.

        3. Tăng biến đếm số document đã xóa (deleteDocCount) lên 1

        4. Nếu sau khi xóa, danh sách rỗng nhưng server vẫn còn tài liệu
        thì trả về null → parent sẽ trigger refetch để tải thêm dữ liệu

        5. Ngược lại, cập nhật state với mảng mới và số đếm mới
      */
      const nextResults = prev.results.filter((x) => x.blog_id !== blog_id);

      const nextTotalDocs = Math.max(0, (prev.totalDocs ?? 0) - 1);

      const nextDeleteDocCount = (prev.deleteDocCount ?? 0) + 1;

      // Nếu rỗng nhưng server vẫn còn tài liệu -> để parent trigger refetch
      if (nextResults.length === 0 && nextTotalDocs > 0) {
        shouldRefetch = true;
        return null;
      }

      // console.log({ ...prev, nextResults, nextTotalDocs, nextDeleteDocCount });

      return {
        ...prev,
        results: nextResults,
        totalDocs: nextTotalDocs,
        deleteDocCount: nextDeleteDocCount,
      };
    });

    if (shouldRefetch && typeof onEmpty === "function") {
      await onEmpty();        // refetch ngay, không cần useEffect
    }

  } catch (error) {
    console.error(error?.message || error);
  
  } finally {
    target.removeAttribute("disabled");
  }
};
