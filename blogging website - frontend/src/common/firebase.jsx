/* 
Import the functions you need from the SDKs you need:
initializeApp: Khởi tạo ứng dụng Firebase.
GoogleAuthProvider: Tạo provider để xác thực bằng tài khoản Google.
getAuth: Lấy instance của Firebase Authentication.
signInWithPopup: Mở popup để đăng nhập bằng Google.
*/

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/*  Cấu hình Google Authentication 
  auth: Lấy instance của Firebase Authentication để quản lý người dùng.
  provider: Tạo Google Provider để đăng nhập bằng Google.

  firebase.jsx	📤 Gửi	Gửi idToken lên server (server.js)
  server.js	📥 Nhận + 📤 Gửi	Nhận idToken, xác thực và tạo access_token rồi gửi lại client
  App.jsx	📥 Nhận	Nhận access_token từ server, lưu vào state và sessionStorage
*/

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/*
  Hàm đăng nhập bằng Google

  Hàm authWithGoogle() được gọi, mở popup đăng nhập Google.
  Khi người dùng chọn tài khoản, Google trả về một GoogleUser object chứa thông tin tài khoản.
  Firebase tạo một ID token (access_token) cho người dùng.
  authWithGoogle() trả về thông tin người dùng (result.user) cho App.jsx.
*/
export const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
    
  } catch (error) {

    console.error("Google Sign-in Error:", error.message);
    console.error("Error Code:", error.code);
    return null;
  }
};
