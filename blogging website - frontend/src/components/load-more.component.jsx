import Button from "./Button";

const LoadMoreDataBtn = ({ state, fetchDataFunc }) => {
  
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <Button
        onClick={() => fetchDataFunc({ page: state.page + 1 })}
        className="flex items-center gap-2 rounded-md p-2 px-3 text-dark-grey "
      >
        Load More
      </Button>
    );
  }
};

export default LoadMoreDataBtn;
