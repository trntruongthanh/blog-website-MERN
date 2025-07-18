const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-lavender p-3 pl-5 border-l-4 border-purple">
      <p>{quote}</p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

export default Quote;
