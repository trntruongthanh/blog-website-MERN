const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt={caption || "image"} />
      {caption?.trim() ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : null}
    </div>
  );
};

export default Img;
