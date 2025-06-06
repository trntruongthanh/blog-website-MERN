import jwt from "jsonwebtoken";

/* bảo vệ các route riêng tư (protected routes)
  next() là một hàm callback có sẵn trong middleware. Khi bạn gọi nó, Express sẽ:
  Chuyển sang middleware tiếp theo trong chuỗi hoặc
  Chuyển đến route xử lý cuối cùng (nơi bạn gửi response).
*/
const verifyJWT = (req, res, next) => {
  // Lấy header 'authorization' từ request. Header này có dạng: "Bearer <token>"
  const authHeader = req.headers["authorization"];

  // Nếu có authHeader thì tách lấy phần token (sau dấu cách). Ngược lại, token là undefined
  const token = authHeader && authHeader.split(" ")[1];

  // Nếu không có token thì từ chối truy cập (401 Unauthorized)
  if (!token) {
    return res.status(401).json({ error: "No access token" });
  }

  // Xác thực token bằng secret key đã định nghĩa trong biến môi trường
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    // Nếu token không hợp lệ hoặc hết hạn → từ chối truy cập (403 Forbidden)
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    // Nếu token hợp lệ → gán user.id từ payload JWT vào req.user để sử dụng trong các route phía sau
    req.user = user.id;

    // Cho phép tiếp tục xử lý route tiếp theo (controller hoặc middleware kế tiếp)
    next();
  });
};

export default verifyJWT;
