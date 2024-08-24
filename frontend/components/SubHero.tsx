export const SubHero = () => {
  return (
    <ul className="flex justify-center gap-12 mt-8 font-[14px]">
      <li className="">
        <div className="">
          <p className="flex gap-2">
            <img
              src={`https://zapier.com/l/images/checkmark.svg`}
              alt="checkItem"
            />
            <strong>Free forever</strong> for core features
          </p>
        </div>
      </li>
      <li className="">
        <div className="">
          <p className="flex gap-2">
            <img
              src={`https://zapier.com/l/images/checkmark.svg`}
              alt="checkItem"
            />
            <strong>More apps</strong> than any other platform
          </p>
        </div>
      </li>
      <li className="">
        <div className="">
          <p className="flex gap-2">
            <img
              src={`https://zapier.com/l/images/checkmark.svg`}
              alt="checkItem"
            />
            Cutting-edge <strong>AI features</strong>
          </p>
        </div>
      </li>
    </ul>
  );
};
