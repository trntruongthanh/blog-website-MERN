import React, { createContext, useContext, useState } from "react";

import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

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
  textEditor là state dùng để lưu trữ instance của EditorJS.
  Ban đầu, state này chỉ là một object tạm thời { isReady: false }, không phải một instance của EditorJS.
  Khi useEffect chạy, setTextEditor(editorInstance); sẽ cập nhật textEditor thành instance thực sự của EditorJS, và lúc đó isReady sẽ trở thành một Promise thay vì false
*/

const Editor = () => {
  
  // State to track which editor view to show (editor or publish form)
  const [editorState, setEditorState] = useState("editor");

  // State to store the EditorJS instance
  const [textEditor, setTextEditor] = useState({ isReady: false });    
    
  // State to store the blog data
  const [blog, setBlog] = useState(blogStructure);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  // Create context value object with editor states and setters
  const value = {
    editorState,
    setEditorState,
    blog,
    setBlog,
    textEditor,
    setTextEditor,
  };

  return (
    <EditorContext.Provider value={value}>
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
