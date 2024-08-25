import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
  pending?: boolean
  
}

export const PrimaryButton = ({
  children,
  onClick,
  size = "small",
  pending
}: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${
        size === "small" ? "text-sm px-8 py-2" : "text-xl px-14 py-3"
      } 
    cursor-pointer hover:shadow-md bg-amber-500 text-white rounded-full text-center flex justify-center flex-col ${pending ? "bg-amber-900" : ""}`}
    disabled = {pending}
    
    >
      {children}
    </button>
  );
}

/**
 * The error you're encountering is due to trying to extend HTMLButtonElement directly in your PrimaryButtonProps interface. However, HTMLButtonElement is a type for the DOM element itself, not the props that a React component should receive.
 * 
 * Instead of extending HTMLButtonElement, you should extend ButtonHTMLAttributes<HTMLButtonElement> from React, which provides the correct types for the props that can be passed to a button element.
 */