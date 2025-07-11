import axios from "axios";
import { useContext, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

import { UserContext } from "../App";
import { BlogContext } from "../pages/blog.page";
import Button from "./button";

import { CommentIcon, FacebookIcon, LikedIcon, LikeIcon } from "../Icons";

/*
| Phần         | Mục đích                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| `useEffect`  | Gửi request kiểm tra xem user đã like bài viết chưa                        |
| `handleLike` | Xử lý logic khi user bấm nút like/unlike (gọi API, cập nhật UI)            |
| UI JSX       | Hiển thị các nút Like, Comment, Edit (nếu là tác giả), và chia sẻ Facebook |

*/

const BlogInteraction = () => {
  const {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    commentsWrapper,
    setCommentsWrapper,
  } = useContext(BlogContext);

  const {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  // =========================== CHECK LIKE LÚC LOAD ============================
  useEffect(() => {
    const fetchApi = async () => {
      try {
        if (access_token) {
          // make request to server to get like information
          const {
            data: { result },
          } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
            { _id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );

          // Nếu server trả về kết quả tồn tại like → cập nhật vào state
          setIsLikedByUser(Boolean(result));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchApi();
  }, [_id]);

  // ========================================================================================

  const handleLike = async () => {
    if (!access_token) {
      toast.error("Please login to like this blog");
      return;
    }

    // Lấy giá trị mới sau khi đảo trạng thái like
    const newIsLikedByUser = !isLikedByUser;

    // // Cập nhật UI trước để tạo cảm giác phản hồi nhanh (optimistic update)
    const updatedLikes = newIsLikedByUser ? total_likes + 1 : total_likes - 1;

    setIsLikedByUser(newIsLikedByUser);

    setBlog({ ...blog, activity: { ...activity, total_likes: updatedLikes } });

    try {
      // Gửi yêu cầu lên server để cập nhật trạng thái like
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
        {
          _id,
          isLikedByUser, // Truyền trạng thái cũ để backend biết là Like hay Unlike
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  // ======================== JSX HIỂN THỊ GIAO DIỆN ============================
  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          {isLikedByUser ? (
            <Button
              onClick={handleLike}
              className="hover:bg-pink-pastel gap-1 w-8 h-8 bg-red/20 rounded-full flex items-center justify-center"
            >
              <LikedIcon className="text-red w-4 h-4 " />
            </Button>
          ) : (
            <Button
              onClick={handleLike}
              className="hover:bg-pink-pastel w-8 h-8 bg-grey/80 rounded-full flex items-center justify-center"
            >
              <LikeIcon className="text-dark-grey w-4 h-4" />
            </Button>
          )}

          <p className="text-sm text-dark-grey">{total_likes}</p>

          <Button
            onClick={() => setCommentsWrapper((prevValue) => !prevValue)}
            className=" w-8 h-8 bg-grey/80 rounded-full flex items-center justify-center"
          >
            <CommentIcon className="text-dark-grey w-4 h-4 " />
          </Button>

          <p className="text-sm text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              className="underline hover:text-purple"
              to={`/editor/${blog_id}`}
            >
              Edit
            </Link>
          ) : (
            ""
          )}

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FacebookIcon className="text-xl hover:text-facebook" />
          </a>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
