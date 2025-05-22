import { Link } from "react-router-dom";
import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";

import { CommentIcon, FacebookIcon, GithubIcon, LikeIcon } from "../Icons";

import Button from "./Button";
import { UserContext } from "../App";

const BlogInteraction = () => {
  const {
    blog: {
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
  } = useContext(BlogContext);

  const {
    userAuth: { username },
  } = useContext(UserContext);

  return (
    <>
      <hr className="border-grey my-2" />

      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <Button className="hover:bg-pink-pastel w-8 h-8 bg-grey/80 rounded-full flex items-center justify-center">
            <LikeIcon className="text-dark-grey w-4 h-4 " />
          </Button>

          <p className="text-sm text-dark-grey">{total_likes}</p>

          <Button className=" w-8 h-8 bg-grey/80 rounded-full flex items-center justify-center">
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
