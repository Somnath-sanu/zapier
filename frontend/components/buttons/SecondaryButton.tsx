import { ReactNode } from "react";

export const SecondaryButton = ({
  children,
  onClick,
  size = "small",
  className
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
  className?: string
}) => {
  return (
    <div
      onClick={onClick}
      className={`${
        size === "small" ? "text-sm px-8 py-2" : "text-xl px-14 py-3"
      } cursor-pointer hover:shadow-md border text-black border-black rounded-full ${className}`}
    >
      {children}
    </div>
  );
};