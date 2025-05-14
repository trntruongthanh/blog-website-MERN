import generateUploadURL from "../utils/generateUploadURL.js";

export const getUploadURL = async (req, res) => {
  try {
    const uploadData = generateUploadURL();

    return res.status(200).json(uploadData);
    
  } catch (error) {
    
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
