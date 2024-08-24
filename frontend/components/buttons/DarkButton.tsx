
import { ReactNode } from "react";

export const DarkButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      onClick={onClick}
      className={`${
        size === "small" ? "text-sm px-8 py-2" : "text-xl px-14 py-3"
      } 
    cursor-pointer hover:shadow-md bg-purple-700 text-white rounded-full text-center flex justify-center flex-col`}
    >
      {children}
    </div>
  );
}