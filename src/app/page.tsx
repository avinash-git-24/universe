import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { CampusBackground } from "@/components/home/CampusBackground";
import { WhyUniverseSection } from "@/components/home/WhyUniverseSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FloatingObjects } from "@/components/home/FloatingObjects";
import { Footer } from "@/components/home/Footer";

export default function RootPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CampusBackground />
      <WhyUniverseSection />
      <HowItWorksSection />
      <FloatingObjects />
      <Footer />
    </>
  );
}
