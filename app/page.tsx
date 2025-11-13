import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/hero-section";
import { MembershipCard } from "@/components/membership-card";
import { MembershipCardv2 } from "@/components/MemberShip-card-v2";
import { SuccessStories } from "@/components/Success-stories";
import { Teachers } from "@/components/Teachers";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SuccessStories />
      <MembershipCard />
      <MembershipCardv2 />
      <Teachers />
      <Faq />
      <Footer />
    </>
  );
}
