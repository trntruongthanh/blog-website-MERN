import axios from "axios";

export const uploadImage = async (img) => {
  try {
    
    // Gọi API từ backend API này trả về các thông tin cần thiết để tải ảnh lên Cloudinary
    const response = await axios.get(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url"
    );

    const { url, timestamp, signature, api_key, public_id } = response.data;

    const formData = new FormData();
    formData.append("file", img);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", api_key);
    formData.append("public_id", public_id);

    // headers: { "Content-Type": "multipart/form-data" } giúp trình duyệt biết đây là dữ liệu dạng multipart.
    const cloudinaryResponse = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return cloudinaryResponse.data.secure_url;

  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
