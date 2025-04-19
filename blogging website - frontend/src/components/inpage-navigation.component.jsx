import { useEffect, useRef, useState } from "react";
import Button from "./Button";

/*
  ref trong React dùng để truy cập trực tiếp đến một DOM element hoặc một React component.
  Nhưng khi bạn dùng ref cho một component do bạn tạo (<Button />) thì sao?
  <Button ref={btnRef}>Click</Button>

👉Lúc này, mặc định React không biết ref đó muốn trỏ tới cái gì trong Button.jsx, vì nó là một component.
  Nếu bạn không làm gì, btnRef.current sẽ là undefined.
*/

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {

  const activeTabLineRef = useRef();
  const activeTabRef = useRef();

  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

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

  useEffect(() => {
    changPageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  //========================================================================================

  /*
    React ngầm hiểu rằng bạn đang truyền nhiều phần tử con (children) vào InPageNavigation. Và khi có nhiều phần tử cùng cấp, React sẽ tự gom chúng thành một mảng.
    {Array.isArray(children) ? children[inPageNavIndex] : children}
  */

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, index) => {
          return (
            <Button
              onClick={(event) => changPageState(event.target, index)}
              ref={index === defaultActiveIndex ? activeTabRef : null}
              key={index}
              className={
                "p-4 px-5 capitalize " +
                (inPageNavIndex === index ? "text-black" : "text-dark-grey ") +
                (defaultHidden.includes(route) ? "md:hidden " : " ")
              }
            >
              {route}
            </Button>
          );
        })}

        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-400" />

      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
