import { nanoid } from "nanoid";
import cloudinary from "../config/cloudinary.js";

const generateUploadURL = () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  const timestamp = Math.round(date.getTime() / 1000);
  const paramsToSign = { timestamp, public_id: imageName };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET_KEY
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    public_id: imageName,
  };
};

export default generateUploadURL;
