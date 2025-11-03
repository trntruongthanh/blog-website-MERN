import axios from "axios";
import { useContext, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { UserContext } from "@/App";

import AnimationWrapper from "@/common/page-animation";
import InputBox from "@/components/input.component";

const ChangePassword = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const changePasswordForm = useRef();

  //============================================================================================================================

  /*
    form.entries() trả về một iterator chứa các cặp key-value đại diện cho các trường input trong form.
    for (let [key, value] of ...) là cú pháp destructuring, giúp tách từng cặp key-value trong mỗi lượt lặp.
    formData[key] = value; sẽ thêm key và value đó vào object formData.
  */
  const handleSubmit = (event) => {
    event.preventDefault();

    let form = new FormData(changePasswordForm.current);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Fill all the inputs");
    }

    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter."
      );
    }

    event.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("Updating...");

    // Function to call the API
    const handleCallApiChangePassword = async () => {
      try {
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
          headers: {
            Authorization: `Bearer ${access_token}`, // Add token for authentication
          },
        });

        // Remove loading toast once request completes successfully
        toast.dismiss(loadingToast);

        // Re-enable the button so user can click again if needed
        event.target.removeAttribute("disabled");

        // Show success toast after successful update
        toast.success("Password Updated !!");

      } catch (error) {

        event.target.removeAttribute("disabled");
        toast.dismiss(loadingToast);

        // Display backend-provided error message if available, otherwise show generic error
        return toast.error(error.response?.data?.error || "Something went wrong!");
      }
    };

    handleCallApiChangePassword();
  };

  //============================================================================================================================

  return (
    <AnimationWrapper>
      <Toaster />

      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden mt-8 font-medium">Change Password</h1>

        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            className="profile-edit-input"
            name="currentPassword"
            type="password"
            placeholder="Current Password"
            icon="password"
          />

          <InputBox
            className="profile-edit-input"
            name="newPassword"
            type="password"
            placeholder="New Password"
            icon="password"
          />

          <button onClick={handleSubmit} className="btn-dark px-10" type="submit">
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
