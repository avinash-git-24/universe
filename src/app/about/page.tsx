import { Metadata } from "next";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ArrowRight, Users, Zap, Shield, CheckCircle2, CreditCard, MapPin, Building, Target, Globe2, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | UniVerse",
  description: "Learn about UniVerse, the student-first campus delivery platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-emerald-50/30 selection:bg-[#22c55e]/20 text-gray-900">
      <Navbar />
      
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/80 to-[#22c55e]/10">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#22c55e]/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-teal-400/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '4s' }} />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-emerald-700 font-semibold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles className="w-4 h-4 text-[#22c55e]" />
              <span>Redefining Campus Logistics</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-teal-500">Student</span> Economy,<br />
              Fully <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-[#22c55e]">Realized.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-950/70 leading-relaxed max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 font-medium">
              UniVerse is the definitive platform connecting students who need time with those who want to earn. Built exclusively for the modern campus ecosystem.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              {[
                { label: "Active Students", value: "0+" },
                { label: "Successful Deliveries", value: "0+" },
                { label: "Partner Universities", value: "0" },
                { label: "Community Rating", value: "New" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center group"
                >
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-950 to-emerald-700 mb-2 group-hover:scale-105 transition-transform duration-500">{stat.value}</div>
                  <div className="text-sm md:text-base font-semibold text-emerald-800/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-gradient-to-br from-[#22c55e] to-emerald-600 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(34,197,94,0.3)] transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
              <div className="relative z-10">
                <Target className="w-12 h-12 text-emerald-100 mb-8" />
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Our Mission</h2>
                <p className="text-emerald-50 text-lg md:text-xl leading-relaxed font-medium">
                  To build the most efficient, safe, and empowering peer-to-peer delivery network exclusively for college students. We believe in turning the dense campus environment into a thriving micro-economy.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border-2 border-emerald-50 p-10 md:p-14 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
              <Globe2 className="w-12 h-12 text-[#22c55e] mb-8" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 mb-6">Our Vision</h2>
              <p className="text-emerald-900/70 text-lg md:text-xl leading-relaxed font-medium">
                A future where every university campus is a fully connected ecosystem. We envision UniVerse as the operating system for campus logistics, where everything a student needs is just minutes away.
              </p>
            </div>
          </div>
        </section>

        {/* HORIZONTAL TIMELINE */}
        <section className="py-24 px-6 max-w-7xl mx-auto bg-gradient-to-b from-white/40 to-emerald-50/40 rounded-[3rem] border border-white">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 mb-6">The Journey So Far</h2>
            <p className="text-xl text-emerald-800/70 max-w-2xl mx-auto font-medium">From a simple dorm room idea to a rapidly expanding campus network.</p>
          </div>

          <div className="relative overflow-x-auto pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-nowrap md:flex-wrap lg:flex-nowrap gap-6 min-w-max lg:min-w-0 px-4 md:px-0 relative">
              {/* Horizontal Line for Desktop */}
              <div className="hidden lg:block absolute top-10 left-0 w-full h-1.5 bg-gradient-to-r from-[#22c55e]/20 via-[#22c55e] to-teal-400 rounded-full" />
              
              {[
                { year: "Phase 1", title: "The Inception", desc: "UniVerse concept is born inside a college dorm to solve real student delivery problems." },
                { year: "Phase 2", title: "First Prototype", desc: "Built the initial MVP. Tested rigorously with a small group of highly engaged students." },
                { year: "Phase 3", title: "Private Beta", desc: "Onboarded the first 100+ active students. Processed initial secure transactions." },
                { year: "Phase 4", title: "Campus Launch", desc: "Official rollout across the primary university campus with full marketing support." },
                { year: "Phase 5", title: "Hyper Growth", desc: "Expanding to multiple universities, connecting thousands of students daily." },
              ].map((milestone, i) => (
                <div key={i} className="relative w-72 md:w-80 shrink-0 group">
                  <div className="hidden lg:flex absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-[5px] border-[#22c55e] z-10 shadow-lg group-hover:scale-150 group-hover:border-teal-400 transition-all duration-300" />
                  
                  <div className="lg:mt-16 bg-white/80 backdrop-blur-lg border border-white/80 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] hover:-translate-y-2 transition-all duration-300">
                    <div className="inline-block px-4 py-1.5 bg-emerald-50 text-[#22c55e] text-sm font-bold rounded-full mb-4">
                      {milestone.year}
                    </div>
                    <h4 className="text-xl font-bold text-emerald-950 mb-3">{milestone.title}</h4>
                    <p className="text-emerald-800/70 font-medium leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY UNIVERSE / FEATURES */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 mb-6">Why UniVerse?</h2>
            <p className="text-xl text-emerald-800/70 max-w-2xl mx-auto font-medium">Built with the unique needs of college students in mind.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 text-[#22c55e] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100/50">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-950 mb-4">{feature.title}</h3>
                <p className="text-emerald-800/70 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAMPUS COMMUNITY SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="bg-emerald-950 rounded-[3rem] p-8 md:p-16 lg:p-24 overflow-hidden relative shadow-2xl flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#22c55e]/20 to-teal-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
            
            <div className="flex-1 relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-100 font-semibold text-sm backdrop-blur-md border border-white/10">
                <Users className="w-4 h-4" />
                <span>The Student Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1]">
                A community built on trust.
              </h2>
              <p className="text-xl text-emerald-100/80 leading-relaxed font-medium max-w-xl">
                By restricting our platform exclusively to verified university students, we&apos;ve created a uniquely safe, high-trust environment where peers feel comfortable delivering to peers.
              </p>
              <div className="pt-4 flex items-center gap-6 text-emerald-100/60 font-medium">
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

            <div className="flex-1 relative z-10 w-full max-w-md mx-auto">
              <div className="relative aspect-square">
                {/* Decorative UI elements representing community */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#22c55e] to-teal-400 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="absolute inset-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex items-center justify-center shadow-2xl">
                   <div className="w-32 h-32 bg-gradient-to-br from-[#22c55e] to-teal-500 rounded-full flex items-center justify-center shadow-inner">
                      <Shield className="w-16 h-16 text-white" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-[#22c55e] via-emerald-500 to-teal-600 rounded-[3rem] p-12 md:p-24 text-center text-white shadow-[0_20px_50px_rgba(34,197,94,0.3)] relative overflow-hidden group">
            {/* Background Animations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-150 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px] -ml-40 -mb-40 transition-transform duration-1000 group-hover:scale-150 pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <Rocket className="w-16 h-16 text-white/90 mx-auto mb-8 animate-bounce" />
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Ready to Start?</h2>
              <p className="text-2xl text-emerald-50 mb-12 font-medium">
                Join the thousands of students already saving time and earning money on campus.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-emerald-900 hover:bg-emerald-50 hover:scale-[1.03] hover:-translate-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300 font-extrabold w-full sm:w-auto">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="ghost" className="rounded-full px-12 h-16 text-lg bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 font-extrabold w-full sm:w-auto">
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
