        [Trình duyệt người dùng]
        ⬇️ nhập URL "/profile"

───────────────────────────────────────────────
📦 React (Frontend - SPA)
───────────────────────────────────────────────
| BrowserRouter / Routes / Route |
| |
| 🛣️ Route: "/profile" |
| ↳ Hiển thị <ProfilePage /> |
| ↳ Gọi API: fetch("/api/user/profile") |
| |
───────────────────────────────────────────────
⬇️ gọi API "/api/user/profile"
───────────────────────────────────────────────
🌐 Express (Backend - Node.js)
───────────────────────────────────────────────
| express.Router() |
| |
| 🛣️ Route: GET "/api/user/profile" |
| ↳ Lấy dữ liệu user từ MongoDB |
| ↳ Trả JSON: { name: "Alice" } |
| |
───────────────────────────────────────────────
⬆️ phản hồi JSON
───────────────────────────────────────────────
React nhận JSON và hiển thị lên UI ✅

| Tên gọi            | Thuộc | Dùng để                      |
| ------------------ | ----- | ---------------------------- |
| `BrowserRouter`    | React | Quản lý URL frontend         |
| `Route`            | React | Quy định component theo path |
| `express.Router()` | Node  | Quản lý API endpoint backend |

===============================================================================

✅ server.use(...) là gì?
server.use() là hàm dùng để đăng ký middleware trong Express. Nó có thể dùng để:
Đăng ký middleware toàn cục (áp dụng cho tất cả request).
Mount (gắn) các route module như /auth, /blogs,...
Thiết lập middleware bên thứ ba như cors, body-parser, helmet, v.v.

| Cách dùng                        | Ý nghĩa                                               |
| -------------------------------- | ----------------------------------------------------- |
| `server.use(middleware)`         | Áp dụng middleware cho **tất cả request**             |
| `server.use("/api", middleware)` | Áp dụng middleware cho các request bắt đầu với `/api` |
| `server.use(routerModule)`       | Gắn module router (có sẵn path trong file router)     |
| `server.use(express.json())`     | Cho phép đọc `req.body` JSON                          |
| `server.use(cors())`             | Cho phép Cross-Origin (frontend gọi backend được)     |

============================================================================================

// 1. Server: res.json({ user })
const { data: { user } } = await axios.post(...);

// 2. Server: res.json({ data: user })
const { data } = await axios.post(...); // data === user

// 3. Server: res.json(user)
const user = (await axios.post(...)).data;

// 4. Server: res.json({ blogs, totalDocs })
const { blogs, totalDocs } = (await axios.post(...)).data;
