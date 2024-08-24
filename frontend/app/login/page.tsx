"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { CheckInfo } from "@/components/CheckInfo";
import { Input } from "@/components/Input";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  return (
    <div className="flex flex-1 justify-evenly">
      <div className="flex flex-col ml-20">
        <h1 className="pr-[50px] mt-36 text-left font-bold text-2xl max-w-2xl mb-4 md:text-3xl md:font-semibold leading-7 tracking-wide">
          Automate across your teams
        </h1>
        <div className="mt-2">
          <p className="max-w-lg">
            Zapier Enterprise empowers everyone in your business to securely
            automate their work in minutes, not months—no coding required.
          </p>
          <SecondaryButton
            onClick={() => {}}
            className="bg-[#3C4593] text-white w-fit rounded-sm p-2 text-lg mt-4"
          >
            {" "}
            Explore Zapier Enterprise{" "}
          </SecondaryButton>
        </div>
      </div>

      <div className=" flex-col flex flex-1 mt-24 justify-center gap-6 border p-4 max-w-xl">
        <div>
          <Input
            label="email"
            placeholder="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Input
            label="password"
            placeholder="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>

        <div className="mt-3 font-bold">
          <PrimaryButton size="big" onClick={async () => {
            const response =  await axios.post(`${BACKEND_URL}/api/v1/user/signin` , {
              username: email,
              password,
              
            })
            localStorage.setItem("token" , response.data?.token)
            router.replace("/dashboard")
          }}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
