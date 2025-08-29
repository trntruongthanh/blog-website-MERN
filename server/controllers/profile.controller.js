import User from "../Schema/User.js";

export const updateProfileImg = async (req, res) => {
  const { url } = req.body;
  const _id = req.user;

  try {
    await User.findOneAndUpdate({ _id }, { "personal_info.profile_img": url });

    return res.status(200).json({ profile_img: url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==================================================================================================

export const updatePersonalInfo = async (req, res) => {
  const bioLimit = 100;

  const _id = req.user;

  const { username, bio, social_links } = req.body;

  // ================== VALIDATE INPUT ==================
  if (!username || username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters" });
  }

  if (bio.length > bioLimit) {
    return res
      .status(400)
      .json({ error: `Bio must be less than ${bioLimit} characters` });
  }


  /*
    const url = new URL("https://facebook.com/thanh.dev");
    console.log(url.hostname); // "facebook.com"
    console.log(url.protocol); // "https:"
    console.log(url.pathname); // "/thanh.dev"
    console.log(url.href);     // "https://facebook.com/thanh.dev"

    Tóm gọn:
    Object.keys(obj) → ["key1", "key2", ...]
    Object.entries(obj) → [["key1", value1], ["key2", value2], ...]
  */

  try {
    const entries = Object.entries(social_links || {}); // Object.entries: Mỗi phần tử là một cặp [key, value]. [["facebook", "..."], ["twitter", "..."], ...]

    /*
      platform lấy key (tên mạng xã hội: "facebook", "twitter", "website").
      rawUrl lấy value (link user nhập).
    */
    for (const [platform, rawUrl] of entries) {

      const url = (rawUrl || "").trim();

      if (!url) continue; // bỏ qua nếu người dùng không nhập

      let hostname = "";

      try {
        // tạo URL một lần, bắt lỗi ngay tại đây
        const u = new URL(url);

        hostname = u.hostname.toLowerCase();

        // (tuỳ chọn) chỉ chấp nhận http/https
        if (!["http:", "https:"].includes(u.protocol)) {
          return res
            .status(400)
            .json({ error: `Invalid protocol for ${platform}. Use http(s).` });
        }

      } catch {
        // URL không hợp lệ (thiếu http/https, sai định dạng)
        return res
          .status(400)
          .json({
            error: `Invalid ${platform} link. Include full http(s) URL.`,
          });
      }

      // "website" được phép domain bất kỳ
      if (platform !== "website") {

        // kiểm tra domain khớp "facebook.com", "twitter.com", ...
        if (!hostname.includes(`${platform}.com`)) {
          return res
            .status(400)
            .json({
              error: `${platform} link is invalid. You must enter a full link`,
            });
        }
      }
    }

  } catch (err) {

    // Trường hợp hiếm: lỗi khác ngoài URL (không phải do input)
    return res
      .status(500)
      .json({ error: "Unexpected error while validating social links." });
  }

  try {
    const updateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      social_links,
    };

    // - runValidators: true để áp dụng schema validation
    await User.findOneAndUpdate({ _id }, updateObj, { runValidators: true });

    return res.status(200).json({ username });

  } catch (error) {

    // Nếu bị trùng username (MongoDB báo lỗi code 11000 - duplicate key)
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    return res.status(500).json({ error: error.message });
  }
};
