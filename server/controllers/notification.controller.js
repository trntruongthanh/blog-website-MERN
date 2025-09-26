import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

/*
  200 OK hoặc 201 Created cho thành công.
  400 Bad Request cho input sai.
  401 Unauthorized khi chưa đăng nhập.
  403 Forbidden khi không đủ quyền.
  404 Not Found khi không có resource.
  500 Internal Server Error cho lỗi hệ thống.
*/

//=================================================================================================================

// kiểm tra xem user có thông báo mới hay không
export const newNotification = async (req, res) => {
  const user_id = req.user;

  try {
    // Kiểm tra trong collection Notification xem có bản ghi nào thỏa điều kiện:
    // - notification_for = user_id (thông báo dành cho user này)
    // - seen = false (thông báo chưa đọc)
    // - user != user_id (người tạo thông báo không phải chính user đó)

    const result = await Notification.exists({
      notification_for: user_id,
      seen: false,
      user: { $ne: user_id }, // $ne = not equal (không bằng)
    });

    // Nếu tìm thấy ít nhất 1 thông báo thỏa điều kiện
    if (result) {
      return res.status(200).json({ new_notification_available: true });
    } else {
      return res.status(200).json({ new_notification_available: false });
    }

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

//==============================================================================================================

// lấy danh sách notifications (thông báo) của user
export const notifications = async (req, res) => {
  const user_id = req.user;

  /*
   - page: số trang (phân trang)
   - filter: loại thông báo cần lọc (ví dụ: "like", "comment", "follow", hoặc "all")
   - deleteDocCount: số document đã bị xoá khỏi DB (để điều chỉnh skip khi phân trang)
  */
  const { page, filter, deleteDocCount } = req.body;

  const maxLimit = 10;

  /* 
    Tính số document cần bỏ qua = (trang hiện tại - 1) * số lượng mỗi trang 
    Nếu có số lượng doc đã xoá (deleteDocCount), thì trừ vào skipDocs
    (giúp tránh bỏ sót/thừa thông báo khi user xoá thông báo ngay trên UI) 
  */
  let skipDocs = Math.max(0, (page - 1) * maxLimit - (deleteDocCount || 0));


  /*
    Query mặc định: lấy các thông báo dành cho user_id
    Và loại bỏ các thông báo mà chính user đó tạo ra
  */
  const findQuery = { notification_for: user_id, user: { $ne: user_id } };


  /* 
    Nếu filter khác "all" thì thêm điều kiện type (lọc theo loại thông báo)
    Nếu client gửi filter = "all" → nghĩa là người dùng muốn xem tất cả các loại thông báo → không cần thêm điều kiện gì.
    Nếu client gửi filter ≠ "all" (ví dụ "comment") → thì thêm điều kiện findQuery.type = filter
    → MongoDB chỉ trả về những thông báo có type = "comment".
  */
  if (filter !== "all") {
    findQuery.type = filter;
  }

  /*
    Populate để lấy thêm thông tin liên quan (thay vì chỉ ObjectId)
  */
  try {
    const notifications = await Notification.find(findQuery)
      .sort({ createdAt: -1 })            // đặt sort trước cho dễ đọc
      .skip(skipDocs)
      .limit(maxLimit)
      .populate("blog", "title blog_id author")
      .populate(
        "user",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .populate({
        path: "comment",
        select: "_id comment commented_by",
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.fullname personal_info.profile_img",
        },
      })
      .populate({
        path: "replied_on_comment",
        select: "_id comment commented_by",
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.fullname personal_info.profile_img",
        },
      })
      .populate({
        path: "reply",
        select: "_id comment commented_by",
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.fullname personal_info.profile_img",
        },
      })
      .select("createdAt type seen comment blog user replied_on_comment reply")

      .lean();

    /* 
      chỉ mark seen cho trang hiện tại 
      notifications ở đây là kết quả bạn vừa find được (10 cái notification của trang hiện tại).
      notifications.map((n) => n._id) → tạo ra mảng các _id của những notification đó.
      { _id: { $in: [...] } } → điều kiện lọc: chỉ chọn những notification có _id nằm trong mảng.
      { $set: { seen: true } } → update: gán trường seen = true.
      updateMany → áp dụng cho tất cả document khớp.
    */
    await Notification.updateMany(
      { _id: { $in: notifications.map((n) => n._id) } },
      { $set: { seen: true } }
    );

    return res.status(200).json({ notifications });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

//==========================================================================================================

export const allNotificationsCount = async (req, res) => {
  const user_id = req.user;

  const { filter } = req.body;

  const findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  try {
    const count = await Notification.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
    
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
