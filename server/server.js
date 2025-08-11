/*
  cors là một middleware trong Express dùng để xử lý CORS (Cross-Origin Resource Sharing) — tức là cho phép hoặc từ chối các request đến từ domain khác.

  bcrypt: Hash password để bảo mật.
  nanoid: Tạo username ngẫu nhiên nếu cần.
  jsonwebtoken: Tạo token JWT để xác thực.


  const server = express(); tạo ra một server Express để:  Quản lý middleware.
  Xử lý API routes.
  Nhận request, gửi response.
  Chạy ứng dụng web bằng server.listen(PORT).


  autoIndex: true ➝ Tự động tạo index trong MongoDB (chỉ dùng trong development).
  autoIndex: false ➝ Không tự động tạo index (dùng trong production).
  Production nên tạo index thủ công để `không ảnh hưởng hiệu suất.
  🚀 Khi phát triển:
  ✔ Dùng autoIndex: true.

  🌍 Khi deploy production:
  ✔ Dùng autoIndex: false + chạy User.syncIndexes().
*/

/*
  Tạo một instance của Express để quản lý API.
  Cổng của server lấy từ biến môi trường hoặc mặc định là 5000.

  6-20 ký tự.
  Ít nhất 1 số (\d).
  Ít nhất 1 chữ thường ([a-z]).
  Ít nhất 1 chữ hoa ([A-Z]).


  Dùng async/await để kết nối MongoDB.
  autoIndex:
  true trong development (tự động tạo index).
  false trong production (tránh ảnh hưởng hiệu suất, cần chạy User.syncIndexes() thủ công).
  Nếu lỗi, log error và dừng server (process.exit(1)).

  Hành động	Cần token không?
👤 Liên quan đến cá nhân	✅ Có
🌍 Công khai, ai cũng xem được	❌ Không
📝 Tạo / sửa / xóa dữ liệu	✅ Có
🔍 Chỉ xem, không cá nhân hóa	❌ Không

======================================================================================

Dùng find() Tìm nhiều document khớp với điều kiện query.
Dùng findOne() Tìm 1 document đầu tiên khớp với điều kiện.
Dung findById() Tìm document theo _id.

| Toán tử   | Ý nghĩa                                         |
| --------- | ----------------------------------------------- |
| `$eq`     | Bằng (`=`)                                      |
| `$ne`     | Khác (`!=`)                                     |
| `$gt`     | Lớn hơn                                         |
| `$gte`    | Lớn hơn hoặc bằng                               |
| `$lt`     | Nhỏ hơn                                         |
| `$lte`    | Nhỏ hơn hoặc bằng                               |
| `$in`     | Giá trị nằm trong mảng                          |
| `$nin`    | Giá trị **không** nằm trong mảng                |
| `$regex`  | So khớp chuỗi bằng biểu thức chính quy (regex)  |
| `$exists` | Kiểm tra trường có tồn tại không                |
| `$type`   | Kiểm tra kiểu dữ liệu (`string`, `number`, ...) |
| `$and`    | Nhiều điều kiện `và`                            |
| `$or`     | Một trong nhiều điều kiện                       |
| `$nor`    | **Không** thuộc bất kỳ điều kiện nào            |
| `$not`    | Phủ định một điều kiện                          |
| `$pull`   | Loại bỏ một (hoặc nhiều) phần tử khỏi mảng mà khớp với giá trị hoặc điều kiện cụ thể.                        |


| Phương thức     | Công dụng                                                            |
| --------------- | -------------------------------------------------------------------- |
| `.limit(n)`     | Giới hạn số document trả về                                          |
| `.skip(n)`      | Bỏ qua `n` document đầu tiên                                         |
| `.sort(obj)`    | Sắp xếp kết quả (`1` tăng dần, `-1` giảm dần)                        |
| `.project(obj)` | Chọn field nào được trả về (thay cho `projection` trong `find`)      |
| `.count()`      | Đếm số document khớp (khuyên dùng `countDocuments()` trong Mongoose) |
| `.populate()`   | (chỉ có trong Mongoose) → lấy dữ liệu từ bảng khác theo `ObjectId`   |


============================================================================================
/*
  Trong Express.js, req.body chứa dữ liệu từ request mà client gửi lên server, thường là dữ liệu JSON từ body của HTTP request.
  📌 Mã hóa mật khẩu bằng bcrypt
  Hash (Băm) là quá trình biến đổi dữ liệu đầu vào thành một chuỗi cố định, không thể khôi phục lại giá trị gốc.
  Hash không thể đảo ngược: Không thể lấy mật khẩu gốc từ chuỗi hash.
  Trong bảo mật, hashing được dùng để lưu mật khẩu thay vì lưu plaintext (mật khẩu thô).
  Nếu hacker lấy được database, họ cũng không biết mật khẩu thật của người dùng.
  
  password: Mật khẩu người dùng nhập vào.
  10: Salt Rounds – số vòng xử lý bổ sung để tăng độ phức tạp (càng cao càng bảo mật, nhưng cũng làm chậm quá trình).
  Lưu ý: Mỗi lần hash, kết quả sẽ khác nhau do bcrypt sử dụng salt để ngăn chặn tấn công từ điển.


  Dòng này khởi tạo một ứng dụng Express mới và gán nó vào biến server.
📦 Cụ thể:
  express() là hàm khởi tạo của thư viện Express.js, giúp bạn tạo một ứng dụng web/server HTTP.
  Biến server chính là instance của ứng dụng Express, dùng để:
  Cấu hình middleware (server.use(...))
  Định nghĩa route (server.get(...), server.post(...), v.v.)
  Khởi chạy server (server.listen(...))


  server.use(express.json()):
    Kích hoạt middleware giúp Express hiểu và phân tích (parse) body của request có định dạng JSON

  server.use(cors()): 
    Kích hoạt CORS middleware để cho phép truy cập từ các domain khác nhau.


| Thuộc tính          | `_id`                                           | `blog_id`                                               |
| ------------------  | ----------------------------------------------- | ------------------------------------------------------- |
| ✅ **Nguồn gốc**    | Tự động do **MongoDB** tạo khi insert tài liệu. | Do bạn tự tạo (thường dùng `slugify(title)` hoặc UUID). |
| ✅ **Kiểu dữ liệu** | `ObjectId` (kiểu riêng của MongoDB).            | `String`.                                               |
| ✅ **Mục đích**     | Dùng để định danh tài liệu trong database.      | Dùng cho URL thân thiện, frontend route, hoặc SEO.      |
| ✅ **Ví dụ**        | `665f05cbf01fd3d3adf63a93`                      | `how-to-code-react-hooks`                               |

| Nếu bạn cần...                              | Nên dùng... |
| ------------------------------------------- | ----------- |
| Truy vấn chính xác document trong MongoDB   | `_id`       |
| Hiển thị trên URL, SEO, người dùng đọc được | `blog_id`   |

*/

import "dotenv/config";
import "./config/firebase.js";

import express from "express";
import cors from "cors";

import connectToMongoDB from "./config/mongoose.js";

import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import interactionRoute from "./routes/interaction.route.js"
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import sideBarsRoutes from "./routes/sideBars.route.js"

//============================================================================================

const server = express();
const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === "production";

server.use(express.json());     // Bắt buộc để đọc JSON từ request body (middleware)
server.use(cors());             // middleware để cho phép truy cập từ các domain khác nhau.   Nếu thiếu dòng này: Trình duyệt sẽ chặn request từ frontend đến backend vì vi phạm chính sách "same-origin policy".

// Connect to MongoDB
connectToMongoDB(process.env.MONGO_BLOG_URL, !isProduction);

// Routes
server.use(authRoutes);

server.use(blogRoutes);

server.use(interactionRoute)

server.use(uploadRoutes);

server.use(userRoutes);

server.use(sideBarsRoutes)

// =======================================================================================
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
