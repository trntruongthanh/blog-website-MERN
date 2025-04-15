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

  Hành động	Cần token không?
👤 Liên quan đến cá nhân	✅ Có
🌍 Công khai, ai cũng xem được	❌ Không
📝 Tạo / sửa / xóa dữ liệu	✅ Có
🔍 Chỉ xem, không cá nhân hóa	❌ Không
*/

import "dotenv/config";

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { nanoid } from "nanoid";

import mongoose from "mongoose";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { v2 as cloudinary } from "cloudinary";

import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";

import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf-8")
);

const server = express();
const PORT = process.env.PORT || 5000;

//==============================================================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//============================================================================================

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const isProduction = process.env.NODE_ENV === "production";

server.use(express.json()); // Bắt buộc để đọc JSON từ request body (middleware)
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

//===============================================================================================

const generateUploadURL = () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  const timestamp = Math.round(date.getTime() / 1000);
  const paramsToSign = { timestamp, public_id: imageName };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET_KEY
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    public_id: imageName,
  };
};

//==============================================================================================

const formatDataSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  // if (!email.includes("@")) throw new Error("Invalid email format");

  let username = email.split("@")[0];

  if (await User.exists({ "personal_info.username": username })) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

//======================================================================================================

/* bảo vệ các route riêng tư (protected routes)
  next() là một hàm callback có sẵn trong middleware. Khi bạn gọi nó, Express sẽ:
  Chuyển sang middleware tiếp theo trong chuỗi hoặc
  Chuyển đến route xử lý cuối cùng (nơi bạn gửi response).
*/
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    req.user = user.id;

    next();
  });
};

//=====================================================================================

/*
  .toLowerCase() giúp đồng bộ URL (chuẩn SEO).
  /[^a-z0-9]+/g: loại bỏ ký tự đặc biệt, giữ lại chữ thường & số.
  .replace(/^-+|-+$/g, ""): xoá dấu - dư ở hai đầu.
  nanoid() thêm phần ngẫu nhiên để tránh trùng slug 
*/
const slugify = (title) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug}-${nanoid()}`;
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

    if (!user.google_auth) {
      const isMatch = await bcrypt.compare(
        password,
        user.personal_info.password
      );

      if (!isMatch) {
        return res.status(403).json({ error: "Incorrect password." });
      }

      return res.status(200).json(formatDataSend(user));
    } else {
      return res.status(403).json({
        error: "Account was created using Google. Try logging in with Google.",
      });
    }
  } catch (error) {
    console.error("Error in /signin:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ====================================================================================
/**
getAuth():
Lấy module xác thực (auth) của Firebase Admin SDK.
Điều này giúp sử dụng các chức năng xác thực của Firebase trên server.

.verifyIdToken(access_token):
Xác minh token ID (access_token) mà client gửi lên.

Ảnh đại diện (picture) được đổi kích thước từ "s96-c" → "s384-c" (chất lượng cao hơn).
*/
server.post("/google-auth", async (req, res) => {
  try {
    let { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "Missing access_token" });
    }

    // Xác minh và giải mã token Google
    const decodedUser = await getAuth().verifyIdToken(access_token);

    // Trích xuất thông tin từ token
    let { email, name, picture } = decodedUser;
    picture = picture.replace("s96-c", "s384-c");

    // Kiểm tra xem user đã tồn tại trong database hay chưa
    let user;

    try {
      user = await User.findOne({ "personal_info.email": email }).select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    // Nếu user đã tồn tại
    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with a password to access the account.",
        });
      }
    } else {
      // Nếu chưa tồn tại, tạo user mới
      const username = await generateUsername(email);

      user = new User({
        personal_info: {
          fullname: name,
          email,
          username,
        },
        google_auth: true,
      });

      try {
        user = await user.save();
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json(formatDataSend(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
server.get("/get-upload-url", async (req, res) => {
  try {
    const uploadData = generateUploadURL();

    return res.status(200).json(uploadData);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
});

//======================================================================================
// middleware verifyJWT
server.post("/create-blog", verifyJWT, async (req, res) => {
  let authorId = req.user;

  let { title, des, banner, tags, content, draft } = req.body;

  // ================= Validation ===================

  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title" });
  }

  if (!draft) {

    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({
          error: "Provide tags in order to publish the blog, Maximum 10",
        });
    }
  }

  // ================== Xử lý ===================

  // Chuyển tất cả tag thành chữ thường để đồng nhất.
  tags = tags.map((tag) => tag.toLowerCase());

  /*
    Tạo blog_id duy nhất:
    1.Thay mọi ký tự không phải chữ cái hay số thành khoảng trắng.
    2.Chuyển mọi khoảng trắng (kể cả nhiều khoảng trắng liên tục) thành dấu gạch ngang -
    3. Xoá khoảng trắng thừa ở đầu và cuối chuỗi.
    Thêm chuỗi ngẫu nhiên (nanoid) để đảm bảo uniqueness.

    let blog_id =
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();
  */

  let blog_id = slugify(title);

  let blog = new Blog({
    title,
    banner,
    des,
    tags,
    content,
    blog_id,
    author: authorId,
    draft: Boolean(draft),
  });

  /*
    Nếu là bản nháp (draft), không tăng số lượng bài viết. Nếu là bài thật, tăng 1 vào account_info.total_posts.
    
    $inc và $push là toán tử (operator) mặc định của MongoDB
    $inc	Increment (Tăng số)	Tăng giá trị một field kiểu số lên một lượng nhất định
    $push	Push vào mảng	Thêm một phần tử vào mảng hiện có trong document
  */
  try {
    const savedBlog = await blog.save();

    const incrementValue = draft ? 0 : 1;

    try {
      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementValue },
          $push: { blogs: savedBlog._id },
        }
      );
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Failed to update total posts number" });
    }

    return res.status(200).json({ id: savedBlog.blog_id });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create blog" });
  }
});

// =======================================================================================
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
});
