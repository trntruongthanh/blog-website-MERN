import axios from "axios";

/*
  create_new_arr:	Nếu là true, tạo mảng mới, không merge vào state. Dùng khi load lần đầu hoặc chuyển sang category mới.
  state:	Dữ liệu hiện tại đang lưu trong useState (ví dụ blogs).
  data:	Dữ liệu blog mới từ API trả về.
  page:	Trang hiện tại đang fetch.
  countRoute:	API route để lấy tổng số blog (totalDocs).
  data_to_send:	Dữ liệu phụ để gửi lên API countRoute (ví dụ tag/category khi filter).
*/

const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
}) => {
  try {
    let obj;

    /* Merge dữ liệu nếu đang phân trang (state != null và create_new_arr === false) 
      state != null: tức là đã có dữ liệu cũ từ useState (ví dụ blogs không phải null)
      !create_new_arr: không tạo mảng mới → ta đang tải thêm trang, không phải load lần đầu hay đổi category.
    */
    if (state != null && !create_new_arr) {

      obj = {
        ...state,
        results: [...state.results, ...data],  // Gộp mảng cũ (state.results) với mảng blog mới (data). Giữ lại blog cũ, nối thêm blog mới vào cuối.
        page: page,                            // Cập nhật page hiện tại bằng số trang mới được fetch (thường là state.page + 1).
      };

    } else {
      
      let { data: { totalDocs }} = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute,
        data_to_send
      );

      obj = { results: data, page: 1, totalDocs };
    }

    return obj;
    
  } catch (error) {
    console.error("Error in filterPaginationData:", error);
    return null;
  }
};

export default filterPaginationData;
