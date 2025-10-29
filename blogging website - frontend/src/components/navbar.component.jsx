import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import { useTheme } from "@/hooks/useTheme";

import images from "../assets/imgs/images";
import { BellIcon, FileEditIcon, MoonIconBold, MoonIconRegular } from "../Icons";

import Button from "./button";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const [userNavPanel, setUserNavPanel] = useState(false);

  let navigate = useNavigate();

  const {
    userAuth,
    setUserAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  const { theme, setTheme } = useTheme();

  const new_notification_available = userAuth?.new_notification_available;

  //===========================================================================================

  useEffect(() => {
    if (!access_token) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (cancelled) return;

        setUserAuth((prev) => ({
          ...prev,
          new_notification_available: !!data?.new_notification_available,
        }));
      } catch (error) {
        console.log(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [access_token]);

  // Handle Search box (min-width: 768px)
  const handleToggleSearchBoxVisibility = () => {
    setSearchBoxVisibility(!searchBoxVisibility); // Đảo ngược trạng thái
  };

  const handleUserNavPanel = () => {
    setUserNavPanel((current) => !current);
  };

  // setTimeout giúp đảm bảo người dùng có thể click vào mục trong menu trước khi nó bị ẩn đi.
  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  //=========================================================================================================

  const handleSearch = (event) => {
    let query = event.target.value;

    if (event.key === "Enter" && query) {
      navigate(`/search/${query}`);
    }
  };

  //=========================================================================================================

  const handleChangeTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
  };

  //=========================================================================================================

  return (
    <>
      <nav className="navbar z-50">
        {/*LOGO*/}
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? images.logo : images.logoWhite} className="w-full" />
        </Link>

        {/*INPUT */}
        <div
          className={
            (searchBoxVisibility ? "block" : "hidden ") +
            "md:block absolute md:relative bg-white w-full md:w-auto left-0 top-full md:top-auto mt-0.5 md:mt-0 border-b border-grey py-4 px-[5vw] md:px-0"
          }
        >
          <input
            onKeyDown={handleSearch}
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 "
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={handleToggleSearchBoxVisibility}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            {/* <i className="fi fi-rr-file-edit"></i> */}
            <FileEditIcon />
            <p>Write</p>
          </Link>

          {theme === "light" ? (
            <Button
              onClick={handleChangeTheme}
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center bg-grey relative",
                theme === "dark" && "hover:bg-slate-600"
              )}
            >
              <MoonIconRegular className="text-dark-grey text-xl" />
            </Button>
          ) : (
            <Button
              onClick={handleChangeTheme}
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center bg-grey relative",
                theme === "dark" && "hover:bg-slate-600"
              )}
            >
              <MoonIconBold className="text-dark-grey text-xl" />
            </Button>
          )}

          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <Button
                  className={
                    "w-12 h-12 rounded-full flex items-center justify-center bg-grey relative hover:bg-black/10 text-dark-grey " +
                    (theme === "dark" && "hover:bg-slate-600")
                  }
                >
                  <BellIcon className="text-xl block mt-1" />

                  {new_notification_available && (
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-3 right-3"></span>
                  )}
                </Button>
              </Link>

              <div onClick={handleUserNavPanel} onBlur={handleBlur} className="relative">
                <button className="w-12 h-12 mt-1">
                  <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                </button>

                {userNavPanel && <UserNavigationPanel />}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>

              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
