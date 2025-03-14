import { Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";

/*
  Điểm cần lưu ý
  Navbar đang được dùng như một layout cha, nhưng trong react-router-dom v6, cần có <Outlet /> trong Navbar để render nội dung của các route con.
  Nếu không có <Outlet />, khi truy cập /signin hoặc /signup, chỉ Navbar hiển thị mà UserAuthForm không xuất hiện.

  Route path="/" element={<Navbar />}:
  Khi truy cập /, thành phần Navbar sẽ được hiển thị.
  Vì Navbar được dùng làm layout cha, nên các route con (signin và signup) sẽ được hiển thị bên trong nó.
*/

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="signin" element={<UserAuthForm type="sign-in" />} />
        <Route path="signup" element={<UserAuthForm type="sign-up" />} />
      </Route>
    </Routes>
  );
};

export default App;
