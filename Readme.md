# Fullstack MERN Blogging Website

Fork this repo of "MERN Blogging Website" to start following the video tutorial.

Checkout website demo - [Demo](https://youtu.be/J7BGuuuvDDk)

![Thumbnail](https://c10.patreonusercontent.com/4/patreon-media/p/post/90122909/dd5363bd03fb4a6c8fcd5d15df98e6bf/eyJ3Ijo4MjB9/1.png?token-time=1697414400&token-hash=BZ-Mzp19WnBLcCFB8LmJFDw98mpnCRGcOCt_T615miY%3D)

This website features include -

1. Modern Blog Editor using Editor JS.
2. Google Authentication for Users
3. Dynamic Blog Pages on dynamic urls.
4. Search Page for Searching Blogs & users.
5. Dedicated Users Profile with thier social links and written blogs.
6. Dedicated dashboard to manage blogs either published or draft.
7. Blog Post Analytics, editable and deletable.
8. Like interaction on Blogs with feature to comment on the blog.
9. Reply to comments. ( A nested Comment System )
10. Every interaction on site stores as a notification for their respective users.
11. Recent notification highlight separating them from old notifications.
12. Edit profile option to update social links, bio and username
13. Also user can change login password from settings.
14. Its mobile responsive with modern design + fade in animation on pages.
    And much more.



let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password    


======================================== Đây trong file server kiểm tra đã kết nối DB
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
200 OK	Request thành công, server trả về dữ liệu.
201 Created	Dữ liệu đã được tạo thành công (thường dùng khi đăng ký tài khoản, tạo bài viết mới, v.v.).
204 No Content	Request thành công nhưng không có dữ liệu trả về.

Mã lỗi Client (4xx)
400 Bad Request	Request bị lỗi (gửi sai định dạng JSON, thiếu tham số, v.v.).
401 Unauthorized	Thiếu hoặc sai access_token, yêu cầu xác thực nhưng không cung cấp token hợp lệ.
403 Forbidden	Truy cập bị từ chối (đúng token nhưng không có quyền).
404 Not Found	Không tìm thấy tài nguyên (ví dụ: ID người dùng không tồn tại).
409 Conflict	Xung đột dữ liệu (ví dụ: đăng ký tài khoản với email đã tồn tại).

500 Internal Server Error	Lỗi phía server (thường là do code backend bị lỗi).
502 Bad Gateway	Server nhận phản hồi không hợp lệ từ một server khác (thường do lỗi proxy, load balancer).
503 Service Unavailable	Server đang bảo trì hoặc quá tải.
504 Gateway Timeout	Request bị timeout khi gọi đến một dịch vụ khác.

Mã lỗi MongoDB (Mongoose Errors)
11000 Duplicate Key	Lỗi trùng dữ liệu, thường gặp khi email hoặc username đã tồn tại trong database và đang cố insert thêm một bản ghi giống hệt.
66 Immutable Field	Cố gắng cập nhật một trường không thể thay đổi (ví dụ: _id).
121 Document Validation Failed	Dữ liệu không hợp lệ do vi phạm schema (ví dụ: nhập số âm vào trường chỉ chấp nhận số dương).
50 Exceeded Time Limit	Query chạy quá lâu, MongoDB tự động dừng để tránh quá tải.

============================================================================================
FILE request.rest
Content-Type	                            Cách gửi dữ liệu	     Middleware cần thiết

application/json	                        { "name": "A" }	          express.json()
application/x-www-form-urlencoded	        name=A&age=20	                  express.urlencoded({ extended: true })
multipart/form-data	Upload file	multer

📌 Ví dụ dùng express.urlencoded() để nhận dữ liệu từ form HTML
server.use(express.urlencoded({ extended: true }));