import { formatDateOnly } from "../common/date";
import Button from "./button";

const CommentCard = ({ index, leftValue, commentData }) => {
  let {
    commented_by: {
      personal_info: { fullname, username, profile_img },
    },
    comment,
    commentedAt,
  } = commentData;

  return (
    <div className="w-full" style={{ paddingLeft: `${leftValue * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{formatDateOnly(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div>
            <Button />
        </div>

      </div>
    </div>
  );
};

export default CommentCard;
