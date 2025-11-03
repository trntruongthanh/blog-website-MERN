/*
  Lưu ý: sessionStorage chỉ lưu chuỗi, nên nếu cần lưu object, phải chuyển thành JSON trước khi lưu:
  storeInSession("user", JSON.stringify(userData));

  Khi nào dùng localStorage?
  Khi bạn muốn lưu dữ liệu dài hạn, ngay cả khi người dùng tắt trình duyệt.

  Khi nào dùng sessionStorage?
  Khi bạn chỉ cần lưu dữ liệu tạm thời, chẳng hạn:
  Thông tin đăng nhập trong phiên (không cần giữ khi tắt trình duyệt).
  Dữ liệu form chưa gửi.
*/

const storeInSession = (key, value) => {
  sessionStorage.setItem(
    key,
    typeof value === "string" ? value : JSON.stringify(value)
  );
};

const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};

const removeFromSession = (key) => {
  return sessionStorage.removeItem(key);
};

const logOutUser = () => {
  sessionStorage.clear();
};

export { storeInSession, lookInSession, removeFromSession, logOutUser };
