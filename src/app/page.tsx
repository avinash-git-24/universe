import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyUniverseSection } from "@/components/home/WhyUniverseSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { Footer } from "@/components/home/Footer";
import { PasswordRecoveryRedirect } from "@/components/home/PasswordRecoveryRedirect";
import { DesktopViewportOnMobile } from "@/components/home/DesktopViewportOnMobile";

export default function RootPage() {
  return (
    <div className="w-full min-w-[1024px] overflow-x-hidden">
      {/* ── Instant Pre-Hydration Viewport Scaler for Mobile ── */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var w = Math.min(window.innerWidth || 1024, (window.screen && window.screen.width) || 1024);
                if (w < 1024) {
                  var s = (w / 1024).toFixed(4);
                  var m = document.querySelector('meta[name="viewport"]');
                  if (m) {
                    m.setAttribute('content', 'width=1024, initial-scale=' + s + ', minimum-scale=' + s + ', maximum-scale=3.0, user-scalable=yes');
                  }
                }
              } catch(e) {}
            })();
          `,
        }}
      />
      <DesktopViewportOnMobile />
      <PasswordRecoveryRedirect />
      <Navbar />
      <HeroSection />
      <WhyUniverseSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
