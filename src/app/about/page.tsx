import { Metadata } from "next";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ArrowRight, Users, Zap, Shield, CheckCircle2, CreditCard, Target, MapPin, Building, Lock, Heart, Lightbulb, FastForward, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | UniVerse",
  description: "Learn about UniVerse, the student-first campus delivery platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-[#22c55e]/20">
      <Navbar />
      
      <main className="flex-1 overflow-hidden">
        
        {/* SECTION 1: HERO */}
        <section className="relative pt-32 md:pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Background Elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#22c55e]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
          <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 font-medium text-sm mb-8">
              <span>🚀</span>
              <span>Campus Delivery Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1]">
              Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-emerald-500">Students.</span><br />
              Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-emerald-500">Community.</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-[700px] mb-16">
              UniVerse was born out of a simple necessity: making campus life easier. We connect students who need things done with those who want to earn on their own schedule.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {[
                { value: "10,000+", label: "Verified Students" },
                { value: "5,000+", label: "Requests Completed" },
                { value: "20+", label: "Partner Campuses" },
                { value: "4.9★", label: "Student Rating" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center text-center"
                >
                  <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: MISSION */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                We&apos;re building the infrastructure for peer-to-peer campus economies. By creating a platform where students can seamlessly trade time and convenience, we&apos;re making university life more connected, efficient, and rewarding for everyone.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                Through cutting-edge technology and a deep understanding of campus dynamics, we empower students to support one another safely and instantly.
              </p>
            </div>
            
            {/* Tailwind-only Modern Illustration */}
            <div className="relative h-[450px] w-full rounded-[2.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-tr from-[#22C55E] to-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-bl from-green-300 to-teal-400 rounded-full blur-3xl opacity-20" />
              
              {/* Floating dots */}
              <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-[#22C55E]/50" />
              <div className="absolute bottom-20 right-16 w-3 h-3 rounded-full bg-emerald-500/50" />
              <div className="absolute top-1/2 right-10 w-1.5 h-1.5 rounded-full bg-green-400/50" />
              
              <div className="relative z-10 w-full max-w-sm flex flex-col gap-4 px-6">
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-xl transform translate-x-4 -rotate-2 hover:rotate-0 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-[#22C55E] shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-1/2 bg-gray-200 rounded-full" />
                    <div className="h-2 w-1/3 bg-gray-100 rounded-full" />
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-xl transform -translate-x-4 rotate-2 hover:rotate-0 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4 ml-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-2/3 bg-gray-200 rounded-full" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHY UNIVERSE */}
        <section className="py-24 px-6 max-w-7xl mx-auto relative">
          <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-green-50/50 blur-[100px] rounded-full z-0 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Why UniVerse</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">The ultimate platform designed exclusively for the campus ecosystem.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Community First", desc: "Build connections and help your peers on campus.", icon: Users },
                { title: "Lightning Fast", desc: "Get what you need in minutes through high-density networks.", icon: Zap },
                { title: "Secure Payments", desc: "100% cashless, escrow-protected transactions.", icon: CreditCard },
                { title: "Live Tracking", desc: "Watch your delivery arrive in real-time.", icon: MapPin },
                { title: "Verified Students", desc: "Exclusive access only for valid .edu email holders.", icon: Shield },
                { title: "Campus Only", desc: "Hyper-focused on your specific university grounds.", icon: Building },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-green-50 text-[#22C55E] rounded-full flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: JOURNEY */}
        <section className="py-24 px-6 max-w-7xl mx-auto bg-gray-50/50 rounded-[3rem] my-12">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Our Journey</h2>
            <p className="text-gray-600 text-lg">How we started and where we&apos;re going.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 bg-gradient-to-b from-[#22C55E]/20 via-[#22C55E] to-emerald-500 rounded-full" />
            
            <div className="space-y-12">
              {[
                { badge: "2024", title: "Idea Born", desc: "UniVerse idea born inside college campus." },
                { badge: "Prototype", title: "Built first MVP", desc: "Built first MVP and tested with students." },
                { badge: "Private Beta", title: "100+ students", desc: "100+ students started using UniVerse." },
                { badge: "Campus Launch", title: "Official launch", desc: "Official launch inside university." },
                { badge: "Growing Fast", title: "Expanding", desc: "Expanding to multiple colleges with thousands of users." },
              ].map((milestone, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={i} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:justify-start' : 'md:justify-end'} group`}>
                    
                    {/* Center Dot */}
                    <div className="absolute left-6 md:left-1/2 w-5 h-5 rounded-full bg-[#22C55E] border-[4px] border-white shadow-sm md:-translate-x-1/2 -translate-x-[10px] top-6 md:top-auto z-10 group-hover:scale-150 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-300" />
                    
                    {/* Content Card */}
                    <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300">
                        <div className="inline-block px-4 py-1.5 bg-green-50 text-[#22C55E] text-sm font-bold rounded-full mb-4">
                          {milestone.badge}
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3">{milestone.title}</h4>
                        <p className="text-gray-600 text-lg leading-relaxed">{milestone.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5: CORE VALUES */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Core Values</h2>
            <p className="text-gray-600 text-lg">The principles that drive our platform forward.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: "Community", icon: Heart, bg: "bg-rose-50", text: "text-rose-600", hover: "hover:shadow-rose-100" },
              { label: "Innovation", icon: Lightbulb, bg: "bg-amber-50", text: "text-amber-600", hover: "hover:shadow-amber-100" },
              { label: "Trust", icon: Lock, bg: "bg-blue-50", text: "text-blue-600", hover: "hover:shadow-blue-100" },
              { label: "Speed", icon: FastForward, bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:shadow-emerald-100" },
              { label: "Opportunity", icon: Briefcase, bg: "bg-purple-50", text: "text-purple-600", hover: "hover:shadow-purple-100" },
            ].map((val, i) => (
              <div 
                key={i} 
                className={`${val.bg} rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl ${val.hover} hover:-translate-y-2 hover:scale-[1.05] transition-all duration-300`}
              >
                <val.icon className={`w-12 h-12 mb-6 ${val.text}`} />
                <h4 className={`text-xl font-bold ${val.text}`}>{val.label}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CALL TO ACTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#22C55E] to-emerald-600 rounded-[3rem] p-12 md:p-24 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">Ready to Join UniVerse?</h2>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-10 h-16 text-lg bg-white text-[#22C55E] hover:bg-gray-50 hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 font-bold">
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="ghost" className="rounded-full px-10 h-16 text-lg bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 font-bold">
                    Learn More
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
