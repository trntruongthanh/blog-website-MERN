import jwt from "jsonwebtoken";


/*
  Tạo (sign) token khi user đăng nhập thành công.
  Sau này, dùng lại để giải mã (verify) token trong middleware (verifyJWT).

  1. jwt.sign(payload, secretKey)
  → Tạo ra một JSON Web Token (chuỗi mã hóa).
  - payload: Dữ liệu muốn mã hóa (thông tin user).
  - secretKey: Khóa bí mật dùng để mã hóa token.

  2. Trả về một object chứa:
  - access_token: Chuỗi token dùng để xác thực người dùng.
  - profile_img: Ảnh đại diện của user.
  - username: Tên đăng nhập của user.
  - fullname: Tên đầy đủ của user.
  - isAdmin: Biến boolean xác định user có phải admin hay không.
*/

const formatDataSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    isAdmin: user.admin,
  };
};

export default formatDataSend;