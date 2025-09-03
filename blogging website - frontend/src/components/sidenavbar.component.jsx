import { useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";

import { UserContext } from "@/App";

import {
  BarsIcon,
  BellIcon,
  BlogIcon,
  DocumentIcon,
  FileEditIcon,
  PasswordIcon,
  UserIcon,
} from "@/Icons";
import Button from "./button";

const SideNav = () => {
  const {
    userAuth,
    userAuth: { access_token },
  } = useContext(UserContext);

  const new_notification_available = userAuth?.new_notification_available;

  // Lấy phần route sau /dashboard/ hoặc /settings/
  let page = location.pathname.split("/")[2];

  // Lưu tên page để hiển thị trên tab (VD: "Blogs", "Notification", ...)
  const [pageState, setPageState] = useState(page.replace("-", " "));

  // Điều khiển trạng thái sidebar trên mobile (ẩn/hiện)
  const [showSideNav, setShowSideNav] = useState(false);

  /*
    activeTabLine: dòng underline chạy bên dưới tab hiện tại.
    sideBarIconTab: nút icon Bars (menu).
    pageStateTab: phần hiển thị tên trang hiện tại (vd: "Blogs").
  */
  let activeTabLine = useRef();
  let sideBarIconTab = useRef();
  let pageStateTab = useRef();

  //==============================================================================================================================

  // Underline khi mount Khi component mount, set vị trí và chiều rộng underline dưới pageStateTab
  useEffect(() => {
    if (pageStateTab.current && activeTabLine.current) {
      const { offsetWidth, offsetLeft } = pageStateTab.current;

      activeTabLine.current.style.width = offsetWidth + "px";

      activeTabLine.current.style.left = offsetLeft + "px";
    }
  }, []);

  useEffect(() => {
    // Ẩn sidebar mobile mỗi khi chọn tab mới
    setShowSideNav(false);

    // Delay 1 tick để DOM render xong
    setTimeout(() => {
      if (!pageStateTab.current || !activeTabLine.current) return;

      pageStateTab.current.click(); // Optional: trigger click để update logic khác (nếu có)

      let { offsetWidth, offsetLeft } = pageStateTab.current;

      activeTabLine.current.style.width = offsetWidth + "px";
      activeTabLine.current.style.left = offsetLeft + "px";
    }, 0);
  }, [pageState]);

  /*
    .style.width = offsetWidth + "px"
    offsetWidth: là chiều rộng thực tế (số) của phần tử được click (event.currentTarget), ví dụ là 64.
    "px": đơn vị CSS.
    Kết quả: gán width cho underline đúng bằng chiều rộng của tab:
    activeTabLine.current.style.width = "64px";
  */
  const changPageState = (event) => {
    // Cập nhật underline dưới tab đang click
    let { offsetWidth, offsetLeft } = event.currentTarget;

    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    const isClickOnBarsIcon = sideBarIconTab.current.contains(event.target);

    if (isClickOnBarsIcon) {
      setShowSideNav((prev) => !prev); // Toggle: nếu đang mở thì đóng, nếu đang đóng thì mở
    } else {
      setShowSideNav(false);
    }
  };

  //==============================================================================================================================

  /*
    | Component | Outlet đặt ở đâu?              | Lý do                                                                         |
    | --------- | ------------------------------ | ----------------------------------------------------------------------------- |
    | `Navbar`  | Ngoài `<nav>`                  | Layout theo chiều **dọc**, nên nội dung trang nằm bên dưới là hợp lý          |
    | `SideNav` | Trong `<section class="flex">` | Layout chia **2 cột**, nên Outlet phải nằm bên cạnh sidebar để đúng giao diện |


    Khi nào dùng cái nào?
    Link → dùng để chuyển hướng bình thường, không quan tâm “đang ở đâu”.
    NavLink → dùng khi cần hiển thị giao diện đặc biệt cho route đang active (ví dụ: đổi màu, gạch chân, highlight...).
  */

  /*
    | Thuộc tính      | `sticky`                         | `fixed`                          |
    | --------------- | -------------------------------- | -------------------------------- |
    | Gắn vào đâu     | **Bên trong phần tử cha**        | **Gắn vào viewport**             |
    | Ra khỏi flow    | Không hoàn toàn                  | Có (bỏ ra khỏi flow bình thường) |
    | Cuộn theo trang | Có, cho đến khi “dính”           | Không cuộn theo                  |
    | Dễ dùng cho     | Header, sidebar trong layout dài | Navbar, button nổi, chat bubble  |
    | Phụ thuộc cha   | ✅ Có                             | ❌ Không                       |

    | Trường hợp                                         | Nên dùng |
    | -------------------------------------------------- | -------- |
    | Navbar luôn hiển thị                               | `fixed`  |
    | Sidebar dính khi cuộn nhưng trong phạm vi nội dung | `sticky` |
    | Floating button cố định góc dưới                   | `fixed`  |
    | Table head giữ nguyên khi cuộn bảng                | `sticky` |


    CSS ý nghĩa
    max-md:flex-col
    Khi dưới breakpoint md (medium: ~768px), chuyển từ layout 2 cột → layout 1 cột (flex-col).

    Sidebar
    sticky top-[80px]: Giữ sidebar cố định khi cuộn, cách top 80px (có thể để trống chỗ cho navbar).

    Nội dung bên trong sidebar:
    md:sticky top-24
    Khi ≥ md, sidebar dính khi cuộn (sticky top 6rem)

    absolute này có tác dụng?
    Khi ở màn hình nhỏ (max-md), layout đang chuyển từ 2 cột → 1 cột (flex-col).
    Lúc này, sidebar sẽ được định vị thủ công bằng absolute, nghĩa là nó sẽ nằm đè lên nội dung thay vì nằm bên trái như desktop.
  
    max-md:top-[64px]
    Khi < md, đặt sidebar cách top 64px (cho responsive navbar thấp hơn desktop).

    max-md:w-[calc(100%+80px)]
    Khi nhỏ hơn md, sidebar chiếm toàn bộ chiều rộng màn hình + thêm 80px (có thể để làm hiệu ứng tràn lề).

    | Trường hợp cha có `position: relative` | Kết quả                                                      |
    | -------------------------------------- | ------------------------------------------------------------ |
    | ✅ Có                                   | `absolute` bám vào cha đó                                    |
    | ❌ Không                                | Tìm ông, cụ... có `position: relative/absolute/fixed/sticky` |
    | ❌ Không ai có                          | Bám vào `body` (toàn màn hình)                               |

    innerText = text hiển thị
    textContent = text có thể bao gồm cả phần ẩn
    innerHTML = có cả HTML bên trong
  */

  return access_token === null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        {/* Sidebar bên trái */}
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <Button
              ref={sideBarIconTab}
              onClick={changPageState}
              className="p-5 capitalize rounded-md"
            >
              <BarsIcon className="pointer-events-none" />
            </Button>

            <Button
              ref={pageStateTab}
              onClick={changPageState}
              className="p-5 capitalize rounded-md"
            >
              {pageState}
            </Button>

            <hr
              ref={activeTabLine}
              className="absolute bottom-0 h-[2px] bg-black transition-all duration-300"
            />
          </div>

          {/*
            Cách hoạt động trên desktop (md: trở lên):
            | Class                        | Ý nghĩa                                                                          |
            | ---------------------------- | -------------------------------------------------------------------------------- |
            | `min-w-[200px]`              | Sidebar rộng tối thiểu 200px                                                     |
            | `md:h-cover`                 | Trên desktop, sidebar có chiều cao đầy đủ (không giới hạn)                       |
            | `md:sticky top-24`           | Giữ sidebar **dính khi cuộn**, cách top 6rem (96px), tạo khoảng trống cho navbar |
            | `md:border-grey md:border-r` | Viền phải                                                                        |
            | `md:pr-0`                    | Không padding phải                                                               |

            Cách hoạt động trên mobile (max-md:):
            | Class                        | Ý nghĩa                                                             |
            | ---------------------------- | ------------------------------------------------------------------- |
            | `absolute`                   | Sidebar thoát khỏi flow, đè lên nội dung                            |
            | `max-md:top-[64px]`          | Cách top 64px (nhường chỗ cho navbar mobile)                        |
            | `max-md:w-[calc(100%+80px)]` | Sidebar chiếm rộng toàn màn hình + 80px (để tạo hiệu ứng tràn viền) |
            | `max-md:px-16`               | Padding trái/phải rộng                                              |
            | `max-md:-ml-7`               | Kéo sidebar ra ngoài một chút về bên trái (cho cảm giác tràn viền)  |

            Lấy nội dung văn bản hiển thị (text) bên trong phần tử HTML mà người dùng vừa tương tác (click, hover, v.v.)
          */}
          <div
            className={
              "min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto")
            }
          >
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey mb-8" />

            {/* -------------------------------------------------------------------------------------- */}

            <NavLink
              to="/dashboard/blogs"
              onClick={(event) => setPageState(event.target.innerText)}
              className="sidebar-link"
            >
              <BlogIcon />
              Blogs
            </NavLink>

            <NavLink
              to="/dashboard/notification"
              onClick={(event) => setPageState(event.target.innerText)}
              className="sidebar-link"
            >
              <div className="relative">
                <BellIcon />
                {new_notification_available && (
                  <span className="bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0"></span>
                )}
              </div>
              Notification
            </NavLink>

            <NavLink
              to="/dashboard/blogs"
              onClick={(event) => setPageState(event.target.innerText)}
              className="sidebar-link"
            >
              <FileEditIcon />
              Write
            </NavLink>

            {/* -------------------------------------------------------------------------------------- */}

            <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
            <hr className="border-grey mb-8" />

            <NavLink
              to="/settings/edit-profile"
              onClick={(event) => setPageState(event.target.innerText)}
              className="sidebar-link"
            >
              <UserIcon />
              Editor Profile
            </NavLink>

            <NavLink
              to="/settings/change-password"
              onClick={(event) => setPageState(event.target.innerText)}
              className="sidebar-link"
            >
              <PasswordIcon />
              Change Password
            </NavLink>
          </div>
        </div>

        {/* Nội dung route con bên phải */}
        <div className="flex-1">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
