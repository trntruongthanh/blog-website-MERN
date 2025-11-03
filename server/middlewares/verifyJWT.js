import jwt from "jsonwebtoken";

/* bảo vệ các route riêng tư (protected routes)
  next() là một hàm callback có sẵn trong middleware. Khi bạn gọi nó, Express sẽ:
  Chuyển sang middleware tiếp theo trong chuỗi hoặc
  Chuyển đến route xử lý cuối cùng (nơi bạn gửi response).

  Thành phần	Vai trò	Liên kết qua đâu
  formatDataSend	Tạo token chứa { id, admin }	JWT token
  verifyJWT	Giải mã token, trích { id, admin } ra để dùng trong request	Cùng SECRET_ACCESS_KEY

  👉 Nói cách khác:
  formatDataSend là người đóng gói thông tin người dùng vào token,
  còn verifyJWT là người mở gói thông tin đó ra ở những request sau.


  🧠 4️⃣ Dòng chảy thực tế (Full Flow)

  1️⃣ User đăng nhập → Backend gọi formatDataSend(user)
  → tạo token chứa { id, admin } → gửi về frontend.

  2️⃣ Frontend lưu token → khi gọi API, thêm vào header:
  Authorization: Bearer <token>

  3️⃣ Backend nhận request → chạy verifyJWT
  → giải mã token, lấy ra req.user, req.admin.
  4️⃣ Controller (VD: createBlog) dùng req.user hoặc req.admin để biết:

  Ai đang gửi request?
  Có phải admin không?

  ✅ Kết luận
  formatDataSend: tạo token (sign)
  verifyJWT: kiểm tra và giải mã token (verify)
  Liên quan gián tiếp thông qua JWT token và cùng một SECRET_ACCESS_KEY.
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
    req.admin = user.admin;

    // Cho phép tiếp tục xử lý route tiếp theo (controller hoặc middleware kế tiếp)
    next();
  });
};

export default verifyJWT;
