import Notification from "../Schema/Notification.js";

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
      user: { $ne: user_id },           // $ne = not equal (không bằng)
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
