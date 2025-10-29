import { useTheme } from "@/hooks/useTheme";
import clsx from "clsx";

const Quote = ({ quote, caption }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={clsx(
        "bg-lavender p-3 pl-5 border-l-4 border-purple",
        theme === "dark" && "bg-slate-600 border-slate-300"
      )}
    >
      <p>{quote}</p>
      {caption.length ? (
        <p className={clsx("w-full text-purple text-base italic", theme === "dark" && "text-gray-300")}>
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

export default Quote;
