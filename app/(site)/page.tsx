import { Hero } from "@/components/sections/Hero";
import { ValueProp } from "@/components/sections/ValueProp";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { PartnerMarquee } from "@/components/sections/PartnerMarquee";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <FeaturedSection />
      <ValueProp />
      <PartnerMarquee />
    </div>
  );
}
