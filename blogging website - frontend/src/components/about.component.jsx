import { Link } from "react-router-dom";

import { formatJoined } from "../common/date";

import { SOCIAL_ICONS } from "../Icons";
import { useTheme } from "@/hooks/useTheme";

const AboutUser = ({ className, dataProfile }) => {
  const {
    personal_info: { bio },
    social_links,
    joinedAt,
  } = dataProfile;

  const { theme, setTheme } = useTheme();

  return (
    <div className={"md:w-[90%] md:mt-7 " + className}>
      <p className="text-xl leading-7">{bio.length ? bio : "Nothing to read here"}</p>

      <div className="flex gap-x-7 gap-y-2 my-7 items-center text-dark-grey">
        {Object.keys(social_links).map((key) => {
          let link = social_links[key];

          if (!link) return null;

          const IconComponent = SOCIAL_ICONS[key];

          return (
            <a
              href={link}
              key={key}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "hover:text-black transition-colors duration-200 " +
                (theme === "dark" ? "hover:text-blue-300" : "")
              }
            >
              {IconComponent ? <IconComponent className="w-6 h-6 text-2xl" /> : null}
            </a>
          );

          // return link ? (
          //   <Link to={link} key={key} target="_blank">
          //     <i
          //       className={
          //         "fi " +
          //         (key !== "website" ? "fi-brands-" + key : "fi-rr-globe")
          //       }
          //     ></i>
          //   </Link>
          // ) : null;
        })}
      </div>

      <p className="text-base text-dark-grey leading-7">Joined on {formatJoined(joinedAt)}</p>
    </div>
  );
};

export default AboutUser;
