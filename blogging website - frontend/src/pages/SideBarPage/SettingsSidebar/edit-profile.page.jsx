import axios from "axios";

import toast, { Toaster } from "react-hot-toast";
import { useContext, useEffect, useRef, useState } from "react";

import { UserContext } from "@/App";
import { profileDataStructure } from "@/pages/profile.page";

import AnimationWrapper from "@/common/page-animation";
import Loader from "@/components/loader.component";
import Button from "@/components/button";
import InputBox from "@/components/input.component";
import { uploadImage } from "@/common/cloudinary";
import { storeInSession } from "@/common/session";
import { useTheme } from "@/hooks/useTheme";

const EditProfile = () => {
  const bioLimit = 100;

  const {
    userAuth,
    setUserAuth,
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(profileDataStructure);
  const [characterLeft, setCharacterLeft] = useState(bioLimit);

  const [updateProfileImg, setUpdateProfileImg] = useState(null);
  const profileImgEle = useRef(null);

  const editProfileForm = useRef();

  const {
    personal_info: { fullname, username: profile_username, profile_img, bio, email },
    social_links,
  } = profile;

  const { theme, setTheme } = useTheme();

  //==================================================================================================

  useEffect(() => {
    if (access_token) {
      const getProfileApi = async () => {
        try {
          const {
            data: { user },
          } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
            username,
          });

          // console.log(user);

          setProfile(user);
          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      };

      getProfileApi();
    }
  }, [access_token]);

  //===================== Upload Avt / Update Avt =============================================================================

  const handleImagePreview = (event) => {
    const image = event.target.files[0];

    if (!image || !profileImgEle.current) {
      return;
    }

    // Hủy URL cũ để tránh memory leak
    if (profileImgEle.current.src?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImgEle.current.src);
    }

    /*
      Câu lệnh profileImgEle.current.src = URL.createObjectURL(image); có công dụng:
      Hiển thị ảnh preview ngay trên UI bằng cách gán một blob URL tạm thời vào src của thẻ <img>.
      Người dùng thấy được avatar mới trước khi bạn thực sự upload file đó lên server.
    */

    const urlBlob = URL.createObjectURL(image);

    profileImgEle.current.src = urlBlob;

    setUpdateProfileImg(image);
  };

  // Cleanup khi unmount: cố gắng revoke nếu đang là blob
  useEffect(() => {
    return () => {
      if (profileImgEle.current?.src?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImgEle.current.src);
      }
    };
  }, []);

  const handleImageUpload = async (event) => {
    event.preventDefault();

    if (!updateProfileImg) {
      toast.error("Please choose an image first.");
      return;
    }

    let loadingToast;

    try {
      loadingToast = toast.loading("Uploading...");

      event.target.setAttribute("disabled", true);

      const url = await uploadImage(updateProfileImg);

      if (url) {
        const {
          data: { profile_img },
        } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
          {
            url,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const newUserAuth = { ...userAuth, profile_img: profile_img };

        storeInSession("user", newUserAuth);
        setUserAuth(newUserAuth);
        setUpdateProfileImg(null);

        toast.success("Profile image updated! 👍🏼");
      }
    } catch (error) {
      console.error("Upload failed:", error);

      toast.error("Upload failed! ❌");
    } finally {
      toast.dismiss(loadingToast); // Đảm bảo loading toast biến mất
      event.target.removeAttribute("disabled");
    }
  };

  const handleCharacterLeft = (event) => {
    setCharacterLeft(bioLimit - event.target.value.length);
  };

  //==================================================================================================

  const handleSubmitProfile = async (event) => {
    event.preventDefault();

    const form = new FormData(editProfileForm.current);

    const formData = {};

    for (const [key, value] of form.entries()) {
      formData[key] = value;
    }

    // console.log(formData)

    const { username, bio, facebook, github, instagram, twitter, website, youtube } = formData;

    if (username.length < 3) {
      return toast.error("Username must be at least 3 characters");
    }

    if (bio.length > bioLimit) {
      return toast.error(`Bio must be less than ${bioLimit} characters`);
    }

    let loadingToast;

    try {
      loadingToast = toast.loading("Updating...");
      event.target.setAttribute("disabled", true);

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: { facebook, github, instagram, twitter, website, youtube },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (userAuth.username !== data.username) {
        const newUserAuth = { ...userAuth, username: data.username };

        storeInSession("user", newUserAuth);
        setUserAuth(newUserAuth);
      }

      toast.success("Profile updated! 👍🏼");
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Update failed!";

      toast.error(msg);
    } finally {
      toast.dismiss(loadingToast);
      event.target.removeAttribute("disabled");
    }
  };

  //==================================================================================================

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />

          <h1 className="max-md:hidden mt-8 font-medium">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImage"
                id="profileImageLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>

                <img ref={profileImgEle} src={profile_img} />
              </label>

              <input
                onChange={handleImagePreview}
                type="file"
                id="uploadImage"
                accept=".png, .jpg, .jpeg"
                hidden
              />

              <Button
                onClick={handleImageUpload}
                className={
                  "btn-light mt-5 max-lg:center lg:w-full px-10" +
                  (theme === "dark" ? " bg-slate-700 hover:bg-slate-500" : "")
                }
              >
                Upload
              </Button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    icon="user"
                    disable={true}
                  />
                </div>

                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    icon="email"
                    disable={true}
                  />
                </div>
              </div>

              <InputBox
                name="username"
                type="text"
                value={profile_username}
                placeholder="Username"
                icon="username"
              />

              <p className="text-dark-grey -mt-3 text-sm italic">
                Username will use to search and will visible to all user
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                placeholder="Bio"
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-10 pl-5 placeholder:text-dark-grey"
                onChange={handleCharacterLeft}
              ></textarea>

              <p className="text-dark-grey text-sm italic">{characterLeft} character left</p>

              <p className="mt-8 text-base text-dark-grey">Add your social handle below</p>

              <div className="md:grid md:grid-cols-2 gap-x-6 mt-3">
                {Object.keys(social_links).map((key, index) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={index}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      iconSocial={key}
                    />
                  );
                })}
              </div>

              <Button
                onClick={handleSubmitProfile}
                className={
                  "hover:bg-dark-grey active:bg-dark-grey bg w-auto px-10 btn-light " +
                  (theme === "dark" ? " bg-slate-700 hover:bg-slate-500" : "")
                }
                type="submit"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
