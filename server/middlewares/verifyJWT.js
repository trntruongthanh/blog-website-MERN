import jwt from "jsonwebtoken";

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

export default verifyJWT;
