import User from "../Schema/User.js";

// Tìm kiếm người dùng
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.body;
    const maxLimit = 50;

    const users = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(maxLimit)
      .select("personal_info.fullname personal_info.username personal_info.profile_img -_id");

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Lấy thông tin profile người dùng
export const getProfile = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt -blogs");

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
