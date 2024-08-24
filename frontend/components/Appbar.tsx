/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { LinkButtton } from "./buttons/LinkButtton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { useEffect, useState } from "react";

export const Appbar = () => {
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setVerified(true);
    }
  }, []);
  return (
    <div className="flex border-b justify-between p-3">
      <div className="flex justify-center items-center gap-4">
        <img src={`/sideMenu.svg`} alt="sideBanner" />
        <img
          src={`/zapier.svg`}
          alt="zapier logo"
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>
      <div className="flex items-center justify-around gap-2">
        <img src={`/org.svg`} alt="zapier logo" />

        <LinkButtton onClick={() => {}}>Contact Sales</LinkButtton>
        {!verified && (
          <>
            <LinkButtton onClick={() => router.push("/login")}>
              Log in
            </LinkButtton>
            <PrimaryButton onClick={() => router.push("/signup")}>
              Sign up
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
};
