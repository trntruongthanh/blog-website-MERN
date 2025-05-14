import { nanoid } from "nanoid";
import User from "../Schema/User.js";

const generateUsername = async (email) => {
  // if (!email.includes("@")) throw new Error("Invalid email format");

  let username = email.split("@")[0];

  if (await User.exists({ "personal_info.username": username })) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

export default generateUsername;
