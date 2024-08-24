import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { HeroVideo } from "@/components/HeroVideo";
import { SubHero } from "@/components/SubHero";
import Image from "next/image";

export default function Home() {
  return (
   <main className="">
    {/* <Appbar/> */}
    <Hero/>
    <SubHero/>
    <HeroVideo/>
   </main>
  );
}
