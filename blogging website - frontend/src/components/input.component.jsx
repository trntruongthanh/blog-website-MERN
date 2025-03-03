import PropTypes from "prop-types";
import { useState } from "react";

import { ICONS } from "../Icons"; // Import từ index.js

const InputBox = ({ name, type, id, value, placeholder, icon }) => {
  const IconComponent = ICONS[icon]; // Lấy icon từ object ICONS

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);       // Đảo ngược trạng thái hiển thị mật khẩu
  };

  return (
    <div className="relative w-[100%] mb-4">
      <input
        id={id}
        name={name}
        type={isPasswordVisible ? "text" : type}
        placeholder={placeholder}
        defaultValue={value}
        className="input-box"
      />

      {/* <i className={`fi ${icon} input-icon`}></i> */}
      {IconComponent && <IconComponent className="input-icon text-dark-grey" />}

      {type === "password" && (
        <div
          onClick={handleTogglePasswordVisibility}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
        >
          {isPasswordVisible ? (
            <ICONS.showEyeIcon className="input-icon text-dark-grey left-[auto] right-4 cursor-pointer" />
          ) : (
            <ICONS.hideEyeIcon className="input-icon text-dark-grey left-[auto] right-4 cursor-pointer" />
          )}
        </div>
      )}
    </div>
  );
};

InputBox.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  icon: PropTypes.oneOf(Object.keys(ICONS)), // Chỉ chấp nhận các key trong ICONS
};

export default InputBox;
