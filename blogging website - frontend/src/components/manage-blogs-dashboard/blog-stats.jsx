const BlogStats = ({ stats }) => {
  // const { total_comments, total_likes, total_reads } = stats;

  return (
    <>
      <div className="flex gap-3 max-lg:mb-6 max-lg:pb-6 max-lg:border-b border-grey">
        {Object.keys(stats).map((key, index) => {
          return !key.includes("parent") ? (
            <div
              key={index}
              className={
                "flex flex-col items-center justify-center p-2 px-4 w-full h-full " +
                (index !== 0 ? "border-l border-grey" : "")
              }
            >
              <h1 className="text-sm font-normal lg:text-xl mb-2">{stats[key].toLocaleString()}</h1>
              <p className="max-lg:text-dark-grey">{key.split("_")[1]}</p>
            </div>
          ) : (
            ""
          );
        })}
      </div>
    </>
  );
};

export default BlogStats;
