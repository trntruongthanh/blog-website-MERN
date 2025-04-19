import { Link } from "react-router-dom";
import formatTimeAgo from "../common/date";

const MinimalBlogPost = ({ data, index }) => {
  const {
    title,
    publishedAt,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img },
    },
  } = data;

  return (
    <Link to={`/trending-blog/${id}`} className="flex gap-5 items-center mb-8">
      <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>

      <div>
        <div className="flex gap-2 items-center mb-4">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{formatTimeAgo(publishedAt)}</p>
        </div>

        <h1 className="blog-title">{title}</h1>

      </div>

    </Link>
  );
};

export default MinimalBlogPost;
