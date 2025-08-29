import { Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";

import { lookInSession } from "./common/session";

import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";

import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/SideBarsPage/change-password.page";
import EditProfile from "./pages/SideBarsPage/edit-profile.page";

/*
  Điểm cần lưu ý
  Navbar đang được dùng như một layout cha, nhưng trong react-router-dom v6, cần có <Outlet /> trong Navbar để render nội dung của các route con.
  Nếu không có <Outlet />, khi truy cập /signin hoặc /signup, chỉ Navbar hiển thị mà UserAuthForm không xuất hiện.

  Route path="/" element={<Navbar />}:
  Khi truy cập /, thành phần Navbar sẽ được hiển thị.
  Vì Navbar được dùng làm layout cha, nên các route con (signin và signup) sẽ được hiển thị bên trong nó.
*/

export const UserContext = createContext({});

const App = () => {
  /*
    lookInSession("user") kiểm tra xem có dữ liệu người dùng trong session storage không.
    JSON.parse() nhận vào một chuỗi JSON và chuyển đổi (transform) nó thành một đối tượng JavaScript
    JSON.stringify() làm điều ngược lại - lấy một đối tượng JavaScript và chuyển đổi nó thành một chuỗi JSON.
  
    Mục đích của đoạn code này là:
    Giữ trạng thái đăng nhập của người dùng sau khi reload trang.
  */
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  const value = {
    userAuth,
    setUserAuth,
  };

  // console.log(userAuth)

  /*
    index là cú pháp mới trong React Router v6 để khai báo route con mặc định của một layout cha.
    Bắt buộc phải có <Outlet /> trong Navbar để route con hiển thị đúng.

    :query là một "route parameter", hay còn gọi là tham số động trên URL.
    :query là phần biến động giay, laptop, sofa là giá trị cụ thể mà bạn có thể truy cập trong component thông qua hook useParams()
  
    :query = định nghĩa route động.
    useNavigate() = dùng để đẩy giá trị vào :query.
    useParams() = dùng để lấy giá trị từ :query.
    Tóm lại: useNavigate đẩy vào, :query nhận vào, useParams đọc ra 🎯

    path="*" – Catch-all Route (Bắt mọi route không khớp)

  ===========================================================================================

    App
    └── <Editor /> mount
        ├── Khởi tạo state: loading = true
        ├── Gọi useEffect: fetch blog từ server
        ├── Khi xong: setBlog + setLoading(false)
        └── Render <BlogEditor />

            <BlogEditor /> mount
            ├── useContext lấy blog + textEditor từ EditorContext
            ├── useEffect kiểm tra !textEditor.isReady
            ├── Gọi new EditorJS(...)
            └── Gán instance vào context
  */

  return (
    <UserContext.Provider value={value}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blog_id" element={<Editor />} />

        <Route path="/" element={<Navbar />}>

          <Route index element={<HomePage />} />

          <Route path="settings" element={<SideNav />}>
            <Route path="edit-profile" element={<EditProfile />} ></Route>
            <Route path="change-password" element={<ChangePassword /> } ></Route>
          </Route>

          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />

          <Route path="search/:query" element={<SearchPage />} />
          <Route path="blog/:blog_id" element={<BlogPage />} />
          <Route path="trending-blog/:blog_id" element={<BlogPage />} />

          <Route path="user/:id" element={<ProfilePage />} />

          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
