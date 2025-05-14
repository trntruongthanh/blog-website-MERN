import axios from "axios";

/*
  về một object mới có dạng:
{
  results: [...],    // Mảng blog mới (gộp hoặc thay mới tùy theo create_new_arr)
  page: ...,         // Số trang hiện tại
  totalDocs: ...     // Tổng số blog (từ API /count)
  
}

  Bạn nên truyền create_new_arr: true cho pagination khi bạn muốn reset hoặc khởi tạo lại dữ liệu blog, thay vì tiếp tục nối thêm trang mới vào danh sách cũ.
  1. Khi chuyển sang một user hoặc author khác
  2. Khi thay đổi bộ lọc (filter)
  3. Khi thực hiện tìm kiếm (search query mới)
  4. Khi người dùng reload lại trang hoặc component mount lại lần đầu

  Ngược lại, không cần create_new_arr: true khi nào?
  Khi load thêm (pagination) để nối dữ liệu hiện có:
  → tức là khi nhấn "Load More":

  Trường hợp	create_new_arr
  Lần đầu fetch dữ liệu	✅ true
  Đổi tag/category/filter	✅ true
  Đổi profile người dùng	✅ true
  Phân trang / Load More	❌ false

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
      
      create_new_arr	Nếu true, xóa dữ liệu cũ, tạo mảng blog mới từ đầu. Dùng khi:
      - Lần đầu vào trang
      - Chuyển sang category khác / tag khác
      
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
