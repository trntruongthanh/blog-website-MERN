import { Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";

import { lookInSession } from "./common/session";

import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";

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
  */

  return (
    <UserContext.Provider value={value}>
      <Routes>
        <Route path="/editor" element={<Editor />} />

        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
