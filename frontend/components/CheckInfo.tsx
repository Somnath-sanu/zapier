export const CheckInfo = ({info}: {info:string}) => {
  return (
    <ul className="flex flex-col py-3 gap-5">
      <div>
        <li className="flex gap-2">
          <div>
            <span className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                height="20"
                width="20"
                size="20"
                color="green"
                className=" fill-green-700"
                name="formCheckCircle"
              >
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8.21 10.79l2.79 2.8 5.29-5.3 1.42 1.42-6.71 6.7-4.21-4.2 1.42-1.42Z"></path>
              </svg>
            </span>
          </div>

          <span className="css-1pjmhmq-FeatureItem--listItemTextStyles">
            {info}
          </span>
        </li>
      </div>
    </ul>
  );
};
