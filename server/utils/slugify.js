import { nanoid } from "nanoid";
import { slugify as translitSlugify } from "transliteration";

/*
  .toLowerCase() giúp đồng bộ URL (chuẩn SEO).
  /[^a-z0-9]+/g: loại bỏ ký tự đặc biệt, giữ lại chữ thường & số.
  .replace(/^-+|-+$/g, ""): xoá dấu - dư ở hai đầu.
  nanoid() thêm phần ngẫu nhiên để tránh trùng slug 
*/

const slugify = (title) => {

  // Sử dụng transliteration để chuyển đổi tiêu đề sang dạng không dấu
  const cleanTitle = translitSlugify(title);

  const slug = cleanTitle
    .toLowerCase()                  // Chuyển về chữ thường
    .replace(/[^a-z0-9]+/g, "-")    // Thay thế các ký tự không phải chữ cái và số thành dấu "-"
    .replace(/^-+|-+$/g, "");       // Loại bỏ dấu "-" thừa ở đầu và cuối

  return `${slug}-${nanoid(5)}`;    // Thêm nanoid vào cuối slug
};

export default slugify;
