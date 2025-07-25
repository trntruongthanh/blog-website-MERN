import { useContext, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { UserContext } from "../App";

import images from "../assets/imgs/images";
import { BellIcon, FileEditIcon } from "../Icons";

import Button from "./button";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const [userNavPanel, setUserNavPanel] = useState(false);

  let navigate = useNavigate()

  //===========================================================================================

  const {
    userAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  // Handle Search box (min-width: 768px)
  const handleToggleSearchBoxVisibility = () => {
    setSearchBoxVisibility(!searchBoxVisibility); // Đảo ngược trạng thái hiển thị mật khẩu
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

  //===========================================================================================

  const handleSearch = (event) => {

    let query = event.target.value;

    if (event.key === "Enter" && query) {
      navigate(`/search/${query}`)
    }
  }

  return (
    <>
      <nav className="navbar z-50">
        {/*LOGO*/}
        <Link to="/" className="flex-none w-10">
          <img src={images.logo} className="w-full" />
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

          {access_token ? (
            <>
              <Link to="/dashboard/notification">
                <Button className="w-12 h-12 rounded-full flex items-center justify-center bg-grey relative hover:bg-black/10">
                  <BellIcon className="text-xl block mt-1" />
                </Button>
              </Link>

              <div
                onClick={handleUserNavPanel}
                onBlur={handleBlur}
                className="relative"
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full"
                  />
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
