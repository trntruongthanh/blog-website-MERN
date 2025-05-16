import { useParams } from "react-router-dom";

const BlogPage = () => {
    const  { blog_id } = useParams()

    return (
        <h1>This is a blogs page - {blog_id}</h1>
    );
}

export default BlogPage;