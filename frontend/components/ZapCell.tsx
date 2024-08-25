export const ZapCell = ({
  name,
  index,
  onClick,
}: {
  name?: string;
  index: number;
  onClick: () => void;
}) => {
  return (
    <div className="border border-black py-4 px-4 flex max-w-md justify-center cursor-pointer w-full" onClick={onClick}>
      <div className="flex text-xl">
        <div className="font-bold">{index}. </div>
        <div>{name}</div>
        
      </div>
     
    </div>
  );
};
