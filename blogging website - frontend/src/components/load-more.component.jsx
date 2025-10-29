import { useTheme } from "@/hooks/useTheme";
import Button from "./button";

/**
  state != null: Đảm bảo đã có dữ liệu blog hiện tại.
  state.totalDocs > state.results.length: Chỉ hiển thị nút nếu chưa hiển thị hết toàn bộ blog.

  additionalParam
  Phân biệt Published / Draft (draft: false/true).
  Giữ context tìm kiếm (queryArg: query nếu đang search).
  Truyền dữ liệu phụ để server tính đúng (deleteDocCount dùng cho phân trang sau khi xoá blog).
 */

const LoadMoreDataBtn = ({ state, fetchDataFunc, additionalParam }) => {
  const { theme, setTheme } = useTheme();

  if (state != null && state.totalDocs > state.results.length) {
    return (
      <Button
        onClick={() => fetchDataFunc({ page: state.page + 1, ...additionalParam })}
        className={
          "flex items-center gap-2 rounded-md p-2 px-3 text-dark-grey " +
          (theme === "dark" ? "hover:bg-slate-600" : " ")
        }
      >
        Load More
      </Button>
    );
  }
};

export default LoadMoreDataBtn;
