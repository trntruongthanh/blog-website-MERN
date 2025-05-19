const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// format đầy đủ thứ trong tuần, ngày, tháng, năm, giờ và phút
export const formatTimeAgo = (dateString) => {
  // Lấy thời gian hiện tại
  const now = new Date();

  const published = new Date(dateString);

  // Tính khoảng cách thời gian giữa hiện tại và thời gian đã publish, đơn vị là giây
  const diff = Math.floor((now - published) / 1000);

  if (diff < 60) return "just done";

  // Nếu dưới 1 giờ → trả về số phút trước
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;

  // Nếu dưới 24 giờ → trả về số giờ trước
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  // Quá 24h → hiển thị Thứ, Ngày Tháng Năm - Giờ:Phút
  const dayOfWeek = days[published.getDay()];

  const day = published.getDate().toString().padStart(2, "0");

  const monthName = month[published.getMonth()];

  const year = published.getFullYear();

  const hour = published.getHours().toString().padStart(2, "0");

  const minute = published.getMinutes().toString().padStart(2, "0");

  return `${dayOfWeek}, ${day} ${monthName} ${year} - ${hour}:${minute}`;
};


// format thứ trong tuần, ngày, tháng, năm
export const formatJoined = (dateString) => {
  const now = new Date();

  const published = new Date(dateString);

  const diff = Math.floor((now - published) / 1000);

  if (diff < 60) return "just done";

  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;

  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  const dayOfWeek = days[published.getDay()];

  const day = published.getDate().toString().padStart(2, "0");

  const monthName = month[published.getMonth()];

  const year = published.getFullYear();

  // Bỏ phần giờ và phút
  return `${dayOfWeek}, ${day} ${monthName} ${year}`;
};


// Format chỉ ngày tháng năm
export const formatDateOnly = (dateString) => {

  const published = new Date(dateString);

  const day = published.getDate().toString().padStart(2, "0");

  const monthName = month[published.getMonth()];

  const year = published.getFullYear();

  return `${day} ${monthName} ${year}`;
};
