import { lookInSession, storeInSession } from "@/common/session";
import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

/* 
    cú pháp này định nghĩa một hàm để phát hiện xem hệ điều hành hoặc trình duyệt của người dùng đang ưu tiên Dark Mode hay không. 
    Nếu máy người dùng đang bật Dark Mode:
    darkThemePreference(); // true và ngược lại
    
    Nói ngắn gọn
    Cú pháp đó giúp biết OS của user đang dark hay light.
    Viết như vậy để khởi tạo theme đúng ngay từ đầu, và có thể theo dõi sự thay đổi nếu muốn.
*/
const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export const ThemeProvider = ({ children }) => {
  
  // 1) Khởi tạo state từ session (lazy initializer để chỉ đọc 1 lần khi mount)
  const [theme, setTheme] = useState(() => {
    const saved = lookInSession("theme");
    return saved || (darkThemePreference() ? "dark" : "light");
  });

  useEffect(() => {

    /*
      Selector áp theme:
      Bạn đang set data-theme trên body, nhưng hầu hết thư viện (kể cả tw-colors) mặc định lắng nghe trên html (document.documentElement).
     */
    document.documentElement.setAttribute("data-theme", theme);

    storeInSession("theme", theme);
  }, [theme]);

  // === Function to toggle between light and dark themes === //
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
