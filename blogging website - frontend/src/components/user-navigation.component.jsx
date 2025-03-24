import { Link } from "react-router-dom";
import { useContext } from "react";

import AnimationWrapper from "../common/page-animation";

import { FileEditIcon } from "../Icons/icon";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };

  const navLinks = [
    { path: `/user/${username}`, label: "Profile" },
    { path: "/dashboard/blogs", label: "Dashboard" },
    { path: "/settings/edit-profile", label: "Settings" },
  ];

  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white absolute right-0 border border-grey w-60  duration-200">
        {navLinks.map(({ path, label }) => (
          <Link key={path} to={path} className="link pl-8 py-4">
            {label}
          </Link>
        ))}

        <span className="absolute border-t border-grey w-[100%]"></span>

        <button
          onClick={signOutUser}
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
        >
          <h1 className="font-bold text-xl m-1">Sign Out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
