"use client";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CheckInfo } from "@/components/CheckInfo";
import { Input } from "@/components/Input";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  return (
    <div className="flex flex-1">
      <div className="flex flex-col ml-20">
        <h1 className="pr-[50px] mt-36 text-left font-bold text-3xl max-w-2xl mb-4 md:text-5xl md:font-semibold leading-7 tracking-wide">
          Join millions worldwide who automate their work using Zapier.
        </h1>
        <div className="mt-2">
          <CheckInfo info="Easy setup, no coding required" />
          <CheckInfo info="Free forever for core features" />
          <CheckInfo info="14-day trial of premium features &amp; apps" />
        </div>
      </div>

      <div className=" flex-col flex flex-1 mt-24 px-4 border p-4 max-w-xl">
        <Input
          label="name"
          placeholder="name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
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
        <div className="mt-3 font-bold">
          <PrimaryButton size="big" onClick={async () => {
           const response =  await axios.post(`${BACKEND_URL}/api/v1/user/signup` , {
              username: email,
              password,
              name
            })
            router.replace("/login")

          }}>
            Get started free
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
