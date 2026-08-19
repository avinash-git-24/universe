import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyUniverseSection } from "@/components/home/WhyUniverseSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FloatingObjects } from "@/components/home/FloatingObjects";
import { Footer } from "@/components/home/Footer";

export default function RootPage() {
  return (
    <>
      <Navbar />
      {/* CampusBackground is rendered internally by HeroSection — do not render again here */}
      <HeroSection />
      <WhyUniverseSection />
      <HowItWorksSection />
      <FloatingObjects />
      <Footer />
    </>
  );
}
