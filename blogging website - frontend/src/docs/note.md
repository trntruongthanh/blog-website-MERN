# Fullstack MERN Blogging Website

let emailRegex = /^\w+([\.-]?\w+)_@\w+([\.-]?\w+)_(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

# Đây trong file server kiểm tra đã kết nối DB

Dễ dàng bắt lỗi kết nối (error).
Biết khi MongoDB bị mất kết nối (disconnected).
Log rõ ràng khi kết nối thành công (connected).

    const db = mongoose.connection;

    db.on("connected", () => {
    console.log("✅ MongoDB connected successfully!");
    });

    db.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected!");
    });

    (async () => {
    await connectDB();

        server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
    })();

============================================================================================

Mã lỗi HTTP (Status Codes)
Mã thành công (2xx)
200 OK Request thành công, server trả về dữ liệu.
201 Created Dữ liệu đã được tạo thành công (thường dùng khi đăng ký tài khoản, tạo bài viết mới, v.v.).
204 No Content Request thành công nhưng không có dữ liệu trả về.

Mã lỗi Client (4xx)
400 Bad Request Request bị lỗi (gửi sai định dạng JSON, thiếu tham số, v.v.).
401 Unauthorized Thiếu hoặc sai access_token, yêu cầu xác thực nhưng không cung cấp token hợp lệ.
403 Forbidden Truy cập bị từ chối (đúng token nhưng không có quyền).
404 Not Found Không tìm thấy tài nguyên (ví dụ: ID người dùng không tồn tại).
409 Conflict Xung đột dữ liệu (ví dụ: đăng ký tài khoản với email đã tồn tại).

500 Internal Server Error Lỗi phía server (thường là do code backend bị lỗi).
502 Bad Gateway Server nhận phản hồi không hợp lệ từ một server khác (thường do lỗi proxy, load balancer).
503 Service Unavailable Server đang bảo trì hoặc quá tải.
504 Gateway Timeout Request bị timeout khi gọi đến một dịch vụ khác.

Mã lỗi MongoDB (Mongoose Errors)
11000 Duplicate Key Lỗi trùng dữ liệu, thường gặp khi email hoặc username đã tồn tại trong database và đang cố insert thêm một bản ghi giống hệt.
66 Immutable Field Cố gắng cập nhật một trường không thể thay đổi (ví dụ: \_id).
121 Document Validation Failed Dữ liệu không hợp lệ do vi phạm schema (ví dụ: nhập số âm vào trường chỉ chấp nhận số dương).
50 Exceeded Time Limit Query chạy quá lâu, MongoDB tự động dừng để tránh quá tải.

============================================================================================
FILE request.rest
Content-Type Cách gửi dữ liệu Middleware cần thiết
application/json { "name": "A" } express.json()
application/x-www-form-urlencoded name=A&age=20 express.urlencoded({ extended: true })
multipart/form-data Upload file multer

📌 Ví dụ dùng express.urlencoded() để nhận dữ liệu từ form HTML
server.use(express.urlencoded({ extended: true }));

============================================================================================
Quy tắc đuôi file cho custom hooks
.js hoặc .ts (nếu dùng TypeScript) → phổ biến nhất.
👉 Vì hook chỉ là hàm logic (không return JSX).
.jsx hoặc .tsx → hiếm khi dùng cho hook, chỉ dùng khi trong hook bạn trực tiếp render JSX (trường hợp rất ít).

src/
 ├── context/
 │    └── ThemeContext.jsx    // Provider + JSX
 │
 ├── hooks/
 │    ├── useTheme.js         // Hook logic (không JSX)
 │    ├── useDebounce.js
 │    └── useFetch.js
 │
 ├── components/
 │    ├── Navbar.jsx
 │    └── Button.jsx
