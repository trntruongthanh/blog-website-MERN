import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  className,
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        className, 
        "px-4 py-2 font-medium transition duration-200",
        "hover:bg-blue-600 active:bg-blue-700",
        "disabled:bg-gray-300 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
