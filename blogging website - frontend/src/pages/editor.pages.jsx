import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

/*
  | Khi nào được chạy?                           | Ý nghĩa                                                                          |   |                                          |
  | -------------------------------------------- | -------------------------------------------------------------------------------- | - | ---------------------------------------- |
  | Khi `BlogEditor` được mount lần đầu          | Kiểm tra nếu chưa có `EditorJS` instance thì mới tạo mới                         |   |                                          |
  | `textEditor` ban đầu là `{ isReady: false }` | Đảm bảo logic `if (!textEditor)                                                  |   | !textEditor.isReady)\` luôn true lần đầu |
  | Sau khi `setTextEditor(editorInstance)`      | Lần sau sẽ không chạy khởi tạo lại vì `textEditor.isReady` là `Promise` (truthy) |   |                                          |

  | Trạng thái  | Giá trị textEditor   | isReady                  |
  | ----------- | -------------------- | ------------------------ |
  | Ban đầu     | `{ isReady: false }` | `false`                  |
  | Sau khi set | `EditorJS instance`  | `Promise` (có `.then()`) |


  textEditor là state dùng để lưu trữ instance của EditorJS.
  Ban đầu, state này chỉ là một object tạm thời { isReady: false }, không phải một instance của EditorJS.
  Khi useEffect chạy, setTextEditor(editorInstance); sẽ cập nhật textEditor thành instance thực sự của EditorJS, và lúc đó isReady sẽ trở thành một Promise thay vì false
*/

const Editor = () => {
  const { blog_id } = useParams();

  // State to track which editor view to show (editor or publish form)
  const [editorState, setEditorState] = useState("editor");

  // State to store the EditorJS instance
  const [textEditor, setTextEditor] = useState({ isReady: false });

  // State to store the blog data
  const [blog, setBlog] = useState(blogStructure);

  const [loading, setLoading] = useState(true);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  //========================================================================================

  /* không được viết 
    useEffect(async () => {
        // ...
    }, []); 

    useEffect không hỗ trợ async function trực tiếp. Khi bạn dùng async như vậy, 
    React sẽ không biết cleanup function là gì, dẫn đến hành vi không mong muốn hoặc crash khi component unmount, đặc biệt là khi rời /editor về /.
  */

  /*
    draft = true trong req.body có nghĩa là người dùng (ở phía client) đang yêu cầu lấy dữ liệu của blog dạng "bản nháp" để tiếp tục chỉnh sửa.
  */
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!blog_id) {
          return setLoading(false);
        }

        const {
          data: { blog },
        } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
          blog_id,
          draft: true,
          mode: "edit",
        });

        setBlog(blog);
        setLoading(false);

      } catch (error) {

        console.log(error);
        setBlog(null);
        setLoading(false);
      }
    };

    fetchBlog();
  }, []);

  //=======================================================================================

  // Create context value object with editor states and setters
  const value = {
    editorState,
    setEditorState,
    textEditor,
    setTextEditor,
    blog,
    setBlog,
  };

  /*
      return (
      <EditorContext.Provider value={value}>
        nếu chưa đăng nhập → <Navigate />
        nếu đang loading → <Loader />
        nếu đã đăng nhập và ở chế độ viết → <BlogEditor />
        nếu ở chế độ xuất bản → <PublishForm />
      </EditorContext.Provider>
    );
  */

  return (
    <EditorContext.Provider value={value}>
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );

  // let content;

  // if (access_token === null) {
  //   content = <Navigate to="/signin" />;
  // } else if (loading) {
  //   content = <Loader />;
  // } else if (editorState === "editor") {
  //   content = <BlogEditor />;
  // } else {
  //   content = <PublishForm />;
  // }

  // return (
  //   <EditorContext.Provider value={value}>{content}</EditorContext.Provider>
  // );

  // return (
  //   <EditorContext.Provider value={value}>
  //     {/* Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập */}
  //     {access_token === null && <Navigate to="/signin" />}

  //     {/* Nếu đang loading dữ liệu, hiển thị Loader */}
  //     {access_token !== null && loading && <Loader />}

  //     {/* Nếu đã đăng nhập, không loading và đang ở trạng thái editor, hiển thị BlogEditor */}
  //     {access_token !== null && !loading && editorState === "editor" && (
  //       <BlogEditor />
  //     )}

  //     {/* Nếu đã đăng nhập, không loading và đang ở trạng thái publish, hiển thị PublishForm */}
  //     {access_token !== null && !loading && editorState === "publish" && (
  //       <PublishForm />
  //     )}
  //   </EditorContext.Provider>
  // );
};

export default Editor;
