import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

import { uploadImage } from "../common/cloudinary";

/**
 * Handle image upload by URL
 * This function is used by the EditorJS Image tool to embed images from URLs
 * @param {string} url - The URL of the image to embed
 * @returns {Object} - Object with success status and file data
 */
const uploadImageByURL = async (url) => {
  try {
    return {
      success: 1,
      file: { url },
    };
  } catch (error) {
    return {
      success: 0,
      message: "Invalid image URL",
    };
  }
};

/**
 * Handle image upload by file
 * This function is used by the EditorJS Image tool to upload images from the user's device
 * @param {File} file - The image file to upload
 * @returns {Object} - Object with success status and file data
 */
const uploadImageByFile = async (file) => {
  try {
    // Upload image to cloud storage and get URL
    const imageUrl = await uploadImage(file);

    if (!imageUrl) {
      throw new Error("Upload failed or no URL returned");
    }

    return {
      success: 1,
      file: {
        url: imageUrl,
      },
    };
  } catch (error) {
    console.error("EditorJS upload error: " + error);

    return {
      success: 0,
      message: "Image upload failed",
    };
  }
};

/**
 * EditorJS tools configuration
 * This object defines which tools are available in the editor and their configurations
  
  Embed tool for embedding external content (videos, tweets, etc.)
  List tool for creating ordered and unordered lists
  Image tool for adding images to the editor
  Header tool for adding headings
  Quote tool for adding blockquotes
  Marker tool for highlighting text
  Inline code tool for adding code snippets within text
 */
export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,  // Allow formatting text within list items
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,    // Function to handle URL-based image uploads
        uploadByFile: uploadImageByFile,  // Function to handle file-based image uploads
      },
      captionPlaceholder: "Type caption here...",
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",   // Placeholder text for empty headers
      levels: [2, 3],                   // Available heading levels (h2, h3)
      defaultLevel: 2,                  // Default heading level
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,                // Allow formatting text within quotes
  },
  marker: Marker,
  inlineCode: InlineCode,
};
