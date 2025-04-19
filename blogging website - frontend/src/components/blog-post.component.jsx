import { Link } from "react-router-dom";

import formatTimeAgo from "../common/date";
import { LikeIcon } from "../Icons";

/*
  sm	≥ 640px	điện thoại lớn / tablet đứng
  md	≥ 768px	tablet nằm ngang / laptop nhỏ
  lg	≥ 1024px	laptop lớn
  xl	≥ 1280px	desktop
  2xl	≥ 1536px	màn cực lớn

  @media not all and (min-width: 640px)
  Câu @media not all and (min-width: 640px) có thể hiểu là:

  "Áp dụng khi không phải là màn hình có min-width: 640px"
  → Tức là: khi chiều rộng nhỏ hơn 640px

  Hoặc đơn giản:

  not all and (min-width: 640px) ≈ (max-width: 639.98px)
*/

const BlogPostCard = ({ data }) => {
  const {
    tags,
    title,
    des,
    banner,
    publishedAt,
    blog_id: id,
    activity: { total_likes },
    author: {
      personal_info: { fullname, username, profile_img },
    },
  } = data;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-8 items-center border-b border-grey pb-5 mb-5"
    >
      <div className="w-full">
        <div className="flex gap-2 items-center mb-4">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{formatTimeAgo(publishedAt)}</p>
        </div>

        <h1 className="blog-title mb-2">{title}</h1>

        <p className="text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
          {des}
        </p>

        <div className="flex gap-4 mt-7">
          <span className="btn-light py-1 px-4">{tags[0]}</span>
          <span className="ml-4 flex items-center gap-2 text-dark-grey">
            <LikeIcon className="w-4" />
            {total_likes}
          </span>
        </div>
      </div>

      <div className="h-28 aspect-square bg-grey">
        <img
          className="w-full h-full aspect-square object-cover rounded"
          src={banner}
        />
      </div>

    </Link>
  );
};

export default BlogPostCard;
