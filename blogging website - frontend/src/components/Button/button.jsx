import React, { forwardRef } from "react";
import clsx from "clsx";

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
        className,
        "font-medium transition duration-200 ease-in-out",
        { "hover:bg-lavender active:bg-lavender": !disabled },
        { "disabled:bg-gray-300 disabled:cursor-not-allowed": disabled }
      )}
    >
      {children}
    </button>
  );
});

export default Button;
