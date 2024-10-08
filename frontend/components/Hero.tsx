"use client";
import { useRouter } from "next/navigation";
// import { Feature } from "./Feature";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";


export const Hero = () => {
  const router = useRouter();
  return (
    <div>
      <div className="flex justify-center">
        <div className="text-5xl  font-[600] tracking-[1px] leading-[0.9em] text-center pt-8 max-w-xl">
          Automate as fast as you can type
        </div>
      </div>
      <div className="flex justify-center pt-1">
        <div className="text-[21px] text-[#201515] font-[500] tracking-wide text-center pt-8 max-w-4xl">
          AI gives you automation superpowers, and Zapier puts them to work.
          Pairing AI and Zapier helps you turn ideas into workflows and bots
          that work for you.
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <div className="flex">
          <div>
            <PrimaryButton
              onClick={() => {
                router.push("/signup");
              }}
              size="big"
            >
              Get Started free
            </PrimaryButton>
          </div>
          <div className="pl-4">
            <div>
              <SecondaryButton onClick={() => {}} size="big">
                Contact Sales
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-center pt-4">
        <Feature title={"Free Forever"} subtitle={"for core features"} />
        <Feature title={"More apps"} subtitle={"than any other platforms"} />
        <Feature title={"Cutting Edge"} subtitle={"AI Features"} />
      </div> */}
    </div>
  );
};