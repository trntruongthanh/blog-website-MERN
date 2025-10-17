import React, { forwardRef } from "react";
import clsx from "clsx";

/*
  ref trong React dùng để truy cập trực tiếp đến một DOM element hoặc một React component.
  Nhưng khi bạn dùng ref cho một component do bạn tạo (<Button />) thì sao?
  <Button ref={btnRef}>Click</Button>
  
 👉Lúc này, mặc định React không biết ref đó muốn trỏ tới cái gì trong Button.jsx, vì nó là một component.
  Nếu bạn không làm gì, btnRef.current sẽ là undefined.

  muốn ref hoạt động, bạn phải dùng forwardRef trong component Button để “chuyển tiếp” ref vào DOM <button> thật:
*/
const Button = forwardRef(function Button(
  { children, className, onClick, type = "button", disabled = false },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "font-medium transition duration-200 ease-in-out",
        { "hover:bg-lavender active:bg-lavender": !disabled },
        { "disabled:bg-gray-300 disabled:cursor-not-allowed": disabled },
        className
      )}
    >
      {children}
    </button>
  );
});

export default Button;
