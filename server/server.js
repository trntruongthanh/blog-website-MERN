import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";

import User from "./Schema/User.js";

/*
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
*/

const server = express();
const PORT = process.env.PORT || 5000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const isProduction = process.env.NODE_ENV === "production";

server.use(express.json());   // Bắt buộc để đọc JSON từ request body (middleware)
server.use(cors());

//============================================================================================
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_BLOG_URL, {
      autoIndex: !isProduction,
    });
    console.log("Connected to MongoDB ✅");
  } catch (error) {

    // Nếu cần tự động kết nối lại, có thể thêm cơ chế retry ở đây
    setTimeout(() => {
      console.log("Retrying MongoDB connection...");
      mongoose
        .connect(process.env.MONGO_BLOG_URL, {
          autoIndex: !isProduction,
        })
        .catch((err) => console.error("MongoDB retry failed:", err));
    }, 5000);
  }

})();

//==============================================================================================================
/*
  access_token quan trọng để xác thực mà không cần gửi lại mật khẩu.
  Nếu thêm thời gian hết hạn (expiresIn), token sẽ luôn khác nhau mỗi lần tạo: { expiresIn: "1h" }
  Cấu trúc của access_token khi sử dụng JWT:

  xxxxx.yyyyy.zzzzz
  Gồm 3 phần: 1️⃣ Header: Chứa thông tin về thuật toán mã hóa (ví dụ: HMAC SHA256).
  2️⃣ Payload: Chứa dữ liệu (ví dụ: id của user).
  3️⃣ Signature: Ký số bằng SECRET_ACCESS_KEY để bảo mật.

  Mỗi lần tạo token mới, payload gần như giống nhau (vì user ID không đổi), nhưng signature sẽ thay đổi theo thời gian tạo token ➝ nhìn thì có vẻ "ngẫu nhiên", nhưng thực chất tuân theo thuật toán mã hóa.
  Ai cũng có thể giải mã được payload nếu có token.
  Nhưng không ai có thể sửa đổi token vì signature được bảo vệ bằng SECRET_ACCESS_KEY.


  Lấy phần trước @ trong email: Nếu email là "nguyenvana@example.com", username sẽ là "nguyenvana"
  User.exists(...) kiểm tra trong database xem có user nào đã dùng username này chưa.
  Nếu username chưa tồn tại, nó sẽ giữ nguyên.
  Nếu username đã tồn tại, nó sẽ tạo một username mới.
  Thêm chuỗi ngẫu nhiên nếu bị trùng
  nanoid() tạo ra một chuỗi ngẫu nhiên.
  substring(0, 5) lấy 5 ký tự đầu tiên của chuỗi ngẫu nhiên.
  Nếu "nguyenvana" đã tồn tại, có thể trở thành "nguyenvanaAb1x9".
*/

const formatDataSend = (user) => ({
  access_token: jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY),
  profile_img: user.personal_info.profile_img,
  username: user.personal_info.username,
  fullname: user.personal_info.fullname,
});

const generateUsername = async (email) => {
  // if (!email.includes("@")) throw new Error("Invalid email format");

  let username = email.split("@")[0];

  if (await User.exists({ "personal_info.username": username })) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

//===========================================================================================================
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
  
*/

server.post("/signup", async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    //📌 validating the data from frontend
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Fullname must be at least 3 letters long." });
    }

    if (!email.length || !emailRegex.test(email)) {
      return res.status(403).json({ error: "Email is invalid" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter.",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    // 📌 Lưu user vào database
    const savedUser = await user.save();

    return res.status(200).json(formatDataSend(savedUser));

  } catch (err) {

    // 📌 Kiểm tra lỗi trùng email
    if (err.code === 11000) {
      return res.status(500).json({ error: "Email already exists" });
    }
    console.error("Error in /signup:", err);

    return res.status(500).json({ error: "Internal server error" });
  }
});

// ==============================================================================================
server.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(403).json({ error: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.personal_info.password);

    if (!isMatch) {
      return res.status(403).json({ error: "Incorrect password." });
    }

    return res.status(200).json(formatDataSend(user));
  } catch (error) {
    console.error("Error in /signin:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
});
