import { Metadata } from "next";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { Users, Zap, Shield, CheckCircle2, CreditCard, MapPin, Building, Target, Globe2, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | UniVerse",
  description: "Learn about UniVerse, the student-first campus delivery platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-emerald-50/30 selection:bg-[#22c55e]/20 text-gray-900 overflow-x-hidden">
      <Navbar />
      
      {/* Global Wrapper for layout containment */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-10">
        
        {/* HERO SECTION */}
        <section className="relative py-24 flex flex-col items-center justify-center text-center min-h-[80vh]">
          {/* Background Elements (Responsive and restricted) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl -z-10">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] aspect-square bg-[#22c55e]/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] aspect-square bg-teal-400/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-[10%] left-[20%] w-[40%] aspect-square bg-emerald-500/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '4s' }} />
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-emerald-700 font-semibold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles className="w-4 h-4 text-[#22c55e]" />
              <span>Redefining Campus Logistics</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-teal-500">Student</span> Economy,<br />
              Fully <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-[#22c55e]">Realized.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-950/70 leading-relaxed max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 font-medium">
              UniVerse is the definitive platform connecting students who need time with those who want to earn. Built exclusively for the modern campus ecosystem.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              {[
                { label: "Active Students", value: "0+" },
                { label: "Successful Deliveries", value: "0+" },
                { label: "Partner Universities", value: "0" },
                { label: "Community Rating", value: "New" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 p-8 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center group h-full"
                >
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-950 to-emerald-700 mb-2 group-hover:scale-105 transition-transform duration-500">{stat.value}</div>
                  <div className="text-sm md:text-base font-semibold text-emerald-800/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-gradient-to-br from-[#22c55e] to-emerald-600 p-10 rounded-[3rem] text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full justify-center">
              <div className="absolute top-0 right-0 w-[50%] aspect-square bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-125" />
              <div className="relative z-10">
                <Target className="w-12 h-12 text-emerald-100 mb-8" />
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Our Mission</h2>
                <p className="text-emerald-50 text-lg leading-relaxed font-medium">
                  To build the most efficient, safe, and empowering peer-to-peer delivery network exclusively for college students. We believe in turning the dense campus environment into a thriving micro-economy.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 p-10 rounded-[3rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 flex flex-col h-full justify-center">
              <Globe2 className="w-12 h-12 text-[#22c55e] mb-8" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mb-6">Our Vision</h2>
              <p className="text-emerald-900/70 text-lg leading-relaxed font-medium">
                A future where every university campus is a fully connected ecosystem. We envision UniVerse as the operating system for campus logistics, where everything a student needs is just minutes away.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="py-24 bg-gradient-to-b from-white/40 to-emerald-50/40 rounded-[3rem] border border-white my-10">
          <div className="text-center mb-16 px-6">
            <h2 className="text-4xl font-extrabold text-emerald-950 mb-6">The Journey So Far</h2>
            <p className="text-xl text-emerald-800/70 max-w-2xl mx-auto font-medium">From a simple dorm room idea to a rapidly expanding campus network.</p>
          </div>

          <div className="px-6 w-full relative">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {[
                { year: "Phase 1", title: "The Inception", desc: "UniVerse concept is born inside a college dorm to solve real student delivery problems." },
                { year: "Phase 2", title: "First Prototype", desc: "Built the initial MVP. Tested rigorously with a small group of highly engaged students." },
                { year: "Phase 3", title: "Private Beta", desc: "Onboarded the first 100+ active students. Processed initial secure transactions." },
                { year: "Phase 4", title: "Campus Launch", desc: "Official rollout across the primary university campus with full marketing support." },
                { year: "Phase 5", title: "Hyper Growth", desc: "Expanding to multiple universities, connecting thousands of students daily." },
              ].map((milestone, i) => (
                <div key={i} className="group relative">
                  <div className="bg-white/80 backdrop-blur-lg border border-white/80 p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    <div className="inline-flex w-fit px-4 py-1.5 bg-emerald-50 text-[#22c55e] text-sm font-bold rounded-full mb-4">
                      {milestone.year}
                    </div>
                    <h4 className="text-lg font-bold text-emerald-950 mb-3">{milestone.title}</h4>
                    <p className="text-emerald-800/70 font-medium text-sm leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY UNIVERSE / FEATURES */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-emerald-950 mb-6">Why UniVerse?</h2>
            <p className="text-xl text-emerald-800/70 max-w-2xl mx-auto font-medium">Built with the unique needs of college students in mind.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Community First", desc: "Build connections and help your peers on campus. It's students helping students.", icon: Users },
              { title: "Lightning Fast", desc: "Get what you need in minutes by leveraging the extreme density of campus housing.", icon: Zap },
              { title: "Secure Payments", desc: "100% cashless, escrow-protected transactions. Your money is always safe.", icon: CreditCard },
              { title: "Live Tracking", desc: "Watch your delivery arrive in real-time on the map with step-by-step updates.", icon: MapPin },
              { title: "Verified Students", desc: "Exclusive access. Only active students with valid .edu email addresses can join.", icon: Shield },
              { title: "Campus Only", desc: "Hyper-focused on your specific university grounds for maximum efficiency.", icon: Building },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm hover:shadow-md hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group h-full flex flex-col"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 text-[#22c55e] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100/50 shrink-0">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-3">{feature.title}</h3>
                <p className="text-emerald-800/70 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAMPUS COMMUNITY SECTION */}
        <section className="py-24">
          <div className="bg-emerald-950 rounded-[3rem] p-10 overflow-hidden relative shadow-lg flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#22c55e]/20 to-teal-500/10 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-100 font-semibold text-sm backdrop-blur-md border border-white/10">
                <Users className="w-4 h-4" />
                <span>The Student Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                A community built on trust.
              </h2>
              <p className="text-lg text-emerald-100/80 leading-relaxed font-medium">
                By restricting our platform exclusively to verified university students, we&apos;ve created a uniquely safe, high-trust environment where peers feel comfortable delivering to peers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-emerald-100/60 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  <span>.edu Email Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  <span>ID Verification</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 mb-10">
          <div className="bg-gradient-to-br from-[#22c55e] via-emerald-500 to-teal-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-xl relative overflow-hidden group flex flex-col items-center">
            <div className="absolute inset-0 bg-black/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
              <Rocket className="w-12 h-12 text-white/90 mb-8 animate-bounce" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to Start?</h2>
              <p className="text-xl text-emerald-50 mb-10 font-medium">
                Join the thousands of students already saving time and earning money on campus.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full">
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-10 h-14 text-base bg-white text-emerald-900 hover:bg-emerald-50 hover:scale-105 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-300 font-extrabold w-full sm:w-auto">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="rounded-full px-10 h-14 text-base bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 font-extrabold w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
      </main>

      <Footer />
    </div>
  );
}
