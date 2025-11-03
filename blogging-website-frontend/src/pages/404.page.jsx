import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import images from "../assets/imgs/images";

const PageNotFound = () => {
  const { theme, setTheme } = useTheme();

  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
        src={theme === "light" ? images.pageNotFound : images.pageNotFoundWhite}
      />

      <h1 className="text-4xl font-mono leading-7">Page Not Found</h1>
      <p className="text-xl text-dark-grey leading-7 mt-8">
        The page you are looking for does not exist. Head back to the{" "}
        <Link className="text-xl text-black underline" to="/">
          {" "}
          Home Page{" "}
        </Link>
      </p>

      <div className="mt-auto">
        {" "}
        <img
          src={theme === "light" ? images.blogSpace : images.blogSpaceWhite}
          className="h-36 w-36 object-contain block mx-auto select-none"
        />
        <p className="text-dark-grey">Read millions of stories around the world</p>
      </div>
    </section>
  );
};

export default PageNotFound;
