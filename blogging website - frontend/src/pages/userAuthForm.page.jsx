import PropTypes from "prop-types";
import { Link, Navigate } from "react-router-dom";

import { useContext, useRef } from "react";
import { UserContext } from "../App";

import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

import images from "../assets/imgs/images";
import InputBox from "../components/input.component";
import AnimationWrapper from "../common/page-animation";

import { storeInSession } from "../common/session";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const authForm = useRef();

  /*
    userAuth: { access_token } → Lấy access_token từ userAuth.
    setUserAuth → Lấy hàm cập nhật trạng thái người dùng.
  */
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);


  const userAuthThroughServer = async (serverRoute, formData) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
        formData
      );

      // console.log("Server response:", response.data);

      storeInSession("user", response.data);    // chuyển đổi đối tượng thành chuỗi. Lưu vào session storage

      setUserAuth(response.data);               // Cập nhật context
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  // ======================================================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type === "sign-in" ? "/signin" : "/signup";

    /*
    FormData là một đối tượng JavaScript giúp thu thập dữ liệu từ <form>.
    Nó tự động lấy tất cả các input fields (text, email, password, file, v.v.) trong form mà không cần truy cập từng phần tử riêng lẻ.
    Thường dùng khi muốn gửi dữ liệu lên server bằng fetch() hoặc axios.
    
    entries() là một phương thức giúp lấy danh sách cặp key-value từ một số kiểu dữ liệu như Object, Array, Map, FormData...
    Nó trả về một iterator (bộ lặp), cho phép duyệt qua từng phần tử bằng for...of.

    Duyệt qua tất cả dữ liệu trong FormData và chuyển nó thành một object JavaScript.
    */

    let form = new FormData(formElement);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { fullname, email, password } = formData;

    if (fullname && fullname.length < 3) {
      return toast.error("Fullname must be at least 3 letters long.");
    }

    // Form Validation
    if (!email.length || !emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };


  //=======================================================================================
  const handleGoogleAuth = async (e) => {
    try {
      e.preventDefault();

      const user = await authWithGoogle();

      if (!user) {
        toast.error("Google authentication failed.");
        return;
      }

      // Lấy Firebase ID Token từ người dùng
      const firebaseIdToken = await user.getIdToken();      // Sử dụng Firebase ID token thay vì Google OAuth token
      
      // console.log("Firebase ID token", firebaseIdToken);

      let serverRoute = "/google-auth";

      let formData = {
        access_token: firebaseIdToken,
      };

      userAuthThroughServer(serverRoute, formData);
    } catch (error) {

      toast.error("Trouble login through Google.");
      return console.log(error);
    }
  };


  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center ">
        <Toaster />

        <form ref={authForm} id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>

          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full name"
              icon="user"
            />
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="email"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="password"
          />

          <button
            onClick={handleSubmit}
            type="submit"
            className="btn-dark center mt-14"
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            onClick={handleGoogleAuth}
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
          >
            <img src={images.google} className="w-5" />
            continue with google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today.
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

UserAuthForm.propTypes = {
  type: PropTypes.string.isRequired,
};

export default UserAuthForm;
