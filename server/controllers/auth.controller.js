import bcrypt from "bcrypt";
import { getAuth } from "firebase-admin/auth";

import User from "../Schema/User.js";

import formatDataSend from "../utils/formatDataSend.js";
import generateUsername from "../utils/generateUsername.js";


let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;


// [POST] /signup
export const signup = async (req, res) => {
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
};


// [POST] /signin
export const signin = async (req, res) => {
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
};


// [POST] /google-auth
/*getAuth():
Lấy module xác thực (auth) của Firebase Admin SDK.
Điều này giúp sử dụng các chức năng xác thực của Firebase trên server.

.verifyIdToken(access_token):
Xác minh token ID (access_token) mà client gửi lên.

Ảnh đại diện (picture) được đổi kích thước từ "s96-c" → "s384-c" (chất lượng cao hơn).
*/
export const googleAuth = async (req, res) => {
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
};
