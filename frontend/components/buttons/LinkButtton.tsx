"use client"

export const LinkButtton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return <div className=" flex justify-center px-2 py-4 cursor-pointer rounded-lg hover:bg-slate-100 font-semibold" onClick={onClick}>
    {children}
  </div>;
};
