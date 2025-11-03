import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "./button";
import { useTheme } from "@/hooks/useTheme";

/*
  routes: danh sách tên tab (mảng string).
  defaultHidden: những route sẽ ẩn ở md (Tailwind md:hidden)—phù hợp ẩn “trending” khỏi nav khi desktop.
  defaultActiveIndex: tab mặc định (thường 0).
  autoSnapOnDesktop: bật/tắt tính năng “resize về tab mặc định”.
  snapBreakpoint: ngưỡng pixel để coi là “desktop” (mặc định 768).
  children: nội dung các tab. Nếu có nhiều tab, React sẽ gom children thành mảng cùng thứ tự với routes.   
*/

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  autoSnapOnDesktop = true,
  snapBreakpoint = 768,
  children,
}) => {
  /*
      Khi rộng màn hình ≥ 768px (md breakpoint), tab "trending blogs" sẽ hiển thị ở sidebar.
    => Nếu người dùng đang ở tab "trending blogs" trong InPageNavigation (mobile),
    ta tự động đưa họ quay về tab mặc định (homepage) để tránh trạng thái "mất tab".

    activeTabLineRef: trỏ tới <hr> làm underline chạy dưới tab active.
    activeTabRef: trỏ tới nút của tab mặc định (để có thể “snap” về nó khi resize).
    inPageNavIndex: index tab hiện hành (UI và panel nội dung dựa vào state này).
  */

  let activeTabLineRef = useRef();
  let activeTabRef = useRef();

  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  const { theme, setTheme } = useTheme();

  //==============================================================================================

  // Hàm chuyển tab (và di chuyển underline)
  const changPageState = (btn, index) => {
    /*
      offsetWidth	Chiều rộng của phần tử btn tính bằng pixel (bao gồm padding + border).
      offsetLeft	Khoảng cách từ cạnh trái của btn đến cạnh trái của phần tử cha chứa nó.

      Dòng 1: Căn chỉnh chiều rộng underline bằng đúng chiều rộng của nút tab.
      Dòng 2: Di chuyển underline tới đúng vị trí nút tab đang được chọn.
    */
    let { offsetWidth, offsetLeft } = btn;

    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";

    setInPageNavIndex(index);
  };

  //============================================================================================

  /*
  useLayoutEffect lúc mount / khi routes hoặc defaultActiveIndex đổi
  → đảm bảo underline được căn ngay từ lần render đầu (tránh tình trạng refresh xong mà gạch chưa hiện).

  useEffect resize listener
  → chỉ chạy khi cửa sổ thay đổi kích thước (và có logic autoSnapOnDesktop). Nó không thay thế được useLayoutEffect.
  */
  useLayoutEffect(() => {
    // underline ngay lần render đầu
    if (activeTabRef.current) {
      changPageState(activeTabRef.current, defaultActiveIndex);
    }
    // khi routes đổi hoặc defaultActiveIndex đổi, cũng căn lại
  }, [routes, defaultActiveIndex]);

  // Nếu đang ở tab trending (index !== default) và resize lên desktop (≥768),
  // Effect “auto snap về tab mặc định” khi resize
  useEffect(() => {
    // nếu autoSnapOnDesktop === false → không làm gì (không gắn listener).
    if (!autoSnapOnDesktop) return;

    const handleResize = () => {
      const w = window.innerWidth;

      // Nếu >= snapBreakpoint và đang ở tab khác tab mặc định
      if (w >= snapBreakpoint && inPageNavIndex !== defaultActiveIndex) {
        // Gọi chung hàm để set underline + index
        if (activeTabRef.current) {
          changPageState(activeTabRef.current, defaultActiveIndex);
        } else {
          // Fallback (hiếm khi xảy ra)
          setInPageNavIndex(defaultActiveIndex);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [autoSnapOnDesktop, snapBreakpoint, inPageNavIndex, defaultActiveIndex]);

  //================================================================================================

  /*
    React ngầm hiểu rằng bạn đang truyền nhiều phần tử con (children) vào InPageNavigation. Và khi có nhiều phần tử cùng cấp, React sẽ tự gom chúng thành một mảng.
    {Array.isArray(children) ? children[inPageNavIndex] : children}
    Dòng ref={index === defaultActiveIndex ? activeTabRef : null} chỉ có tác dụng lúc component render, để gán ref cho tab mặc định (thường là tab đầu tiên).
  */

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, index) => {
          return (
            <Button
              onClick={(event) => changPageState(event.currentTarget, index)}
              ref={index === defaultActiveIndex ? activeTabRef : null}
              key={index}
              className={
                "p-4 px-5 capitalize " +
                (inPageNavIndex === index ? "text-black" : "text-dark-grey ") +
                (defaultHidden.includes(route) ? "md:hidden " : " ") +
                (theme === "dark" ? "hover:bg-slate-600" : " ")
              }
            >
              {route}
            </Button>
          );
        })}

        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 h-[2px] bg-black transition-all duration-300 border-dark-grey"
        />
      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
