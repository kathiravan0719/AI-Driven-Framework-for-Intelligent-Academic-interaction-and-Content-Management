import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Globe, 
  ShieldCheck,
  Zap,
  ChevronRight,
  GraduationCap
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { posts, users, currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    activeToday: 0,
  });

  useEffect(() => {
    setStats({
      totalPosts: posts.length,
      totalUsers: users.length,
      activeToday: users.filter((u) => {
        const lastActive = new Date(u.lastActive || Date.now());
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
      }).length,
    });
  }, [posts, users]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary-blue/20 overflow-x-hidden transition-colors duration-300">
      <Header />

      {/* Hero Aura Background - Refined Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-primary-blue/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-primary-navy/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10">
        {/* HERO SECTION — White card on blue-grey bg */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 pb-16">
          <div className="bg-bg-card dark:bg-slate-800 rounded-3xl shadow-sm border border-border-color overflow-hidden transition-colors duration-300">
            <div className="pt-16 pb-20 px-8 md:px-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-border-color text-primary-blue text-[11px] font-bold uppercase tracking-[0.25em] mb-8">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Future of Campus Intelligence
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                  <span className="text-text-primary">Connect. Collaborate.</span>
                  <br />
                  <span className="gradient-text">Contribute.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-base md:text-lg text-text-secondary font-medium leading-relaxed mb-10 px-4">
                  Join discussions, share ideas, and build community with your fellow students and faculty.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
                  <button
                    onClick={() => navigate("/signup")}
                    className="group relative w-full sm:w-auto px-8 py-3.5 bg-primary-blue hover:bg-primary-navy text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-blue/25 active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Join Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/ai-chat")}
                    className="w-full sm:w-auto px-8 py-3.5 bg-bg-card dark:bg-slate-800 border-2 border-primary-blue hover:bg-blue-50 dark:hover:bg-slate-700 text-primary-blue rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Explore Discussions
                    <Cpu className="w-4 h-4 text-primary-azure" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>



        {/* STATISTICS SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-text-primary mb-3 tracking-tight">Platform Vitality</h2>
               <p className="text-text-secondary font-medium uppercase tracking-widest text-[11px]">Real-time metrics from our active academic ecosystem</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard icon={<Users className="w-7 h-7" />} value={stats.totalUsers} label="Registered Scholars" suffix="+" color="blue" />
               <StatCard icon={<MessageSquare className="w-7 h-7" />} value={stats.totalPosts} label="Knowledge Streams" suffix="" color="blue" />
               <StatCard icon={<Activity className="w-7 h-7" />} value={stats.activeToday} label="Interactions Today" suffix="" color="blue" />
            </div>
        </section>

        {/* CORE PILLARS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
           <div className="bg-bg-card dark:bg-slate-800 rounded-3xl border border-border-color p-10 md:p-16 shadow-sm transition-colors duration-300">
              <h2 className="text-3xl font-black text-text-primary mb-12 tracking-tight text-center">Intelligence Built-In</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
                  <Pillar icon={<Zap />} title="Real-time RAG" desc="Instant document insights via vector search" />
                  <Pillar icon={<Globe />} title="Open Network" desc="Collab with students across all departments" />
                  <Pillar icon={<ShieldCheck />} title="Privacy First" desc="Secure, institutional-grade data handling" />
                  <Pillar icon={<Sparkles />} title="Generative UI" desc="Context-aware chat and learning interfaces" />
              </div>
           </div>
        </section>

        {/* FEATURED DOMAINS */}
        <section className="py-16">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                 <div>
                    <h2 className="text-3xl font-black text-text-primary mb-3 tracking-tight">Featured Domains</h2>
                    <p className="text-text-secondary font-medium uppercase tracking-widest text-[11px]">Dive into specialized knowledge sectors</p>
                 </div>
                 <button onClick={() => navigate('/feed')} className="flex items-center gap-3 text-primary-blue font-black hover:text-primary-navy transition-all group">
                    <span className="uppercase tracking-[0.2em] text-[10px]">View Knowledge Base</span>
                    <div className="p-2 bg-primary-blue/5 rounded-lg group-hover:translate-x-2 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <TopicCard
                  title="Tech Talks"
                  icon={<Cpu />}
                  description="Quantum computing, AI, and modern web architectures"
                  count={posts.filter((p) => p.category === "Tech").length}
                />
                <TopicCard
                  title="Campus Pulse"
                  icon={<Calendar className="w-5 h-5" />}
                  description="Live events, workshops, and placement drives"
                  count={posts.filter((p) => p.category === "Events").length}
                />
                <TopicCard
                  title="General Forum"
                  icon={<MessageSquare />}
                  description="Social interactions and community discussions"
                  count={posts.filter((p) => p.category === "General").length}
                />
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-blue-900 dark:bg-slate-950 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="group flex items-center gap-4 font-black mb-8">
                <div className="relative w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center p-2.5 shadow-2xl group-hover:scale-110 transition-all">
                  <GraduationCap className="w-full h-full text-primary-azure" />
                  <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="text-3xl tracking-tighter">AI College CMS</span>
              </Link>
              <p className="text-blue-200 max-w-sm leading-relaxed font-medium">
                The official AI-powered campus management system. Streamlining communication, 
                knowledge sharing, and academic excellence through edge technology.
              </p>
            </div>
            <div>
              <h3 className="font-black text-white mb-8 uppercase tracking-[0.3em] text-[10px]">Resources</h3>
              <ul className="space-y-5">
                <li><Link to="/content" className="text-blue-200 hover:text-white font-bold transition-colors">Digital Library</Link></li>
                <li><Link to="/ai-chat" className="text-blue-200 hover:text-white font-bold transition-colors">AI Learning Hub</Link></li>
                <li><Link to="/topics" className="text-blue-200 hover:text-white font-bold transition-colors">Popular Topics</Link></li>
              </ul>
            </div>
            <div>
               <h3 className="font-black text-white mb-8 uppercase tracking-[0.3em] text-[10px]">Network Status</h3>
               {currentUser ? (
                <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 shadow-3xl">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary-blue/40 text-white flex items-center justify-center text-xs font-black ring-1 ring-primary-blue/50">
                        {currentUser.role?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-black text-white">{currentUser.name}</div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Signal Active</div>
                   </div>
                </div>
               ) : (
                <button onClick={() => navigate('/login')} className="w-full py-4 px-6 bg-white/10 border border-white/20 rounded-2xl text-white font-black hover:bg-white/20 transition-all uppercase tracking-widest text-[11px] shadow-2xl">
                  Establish Connection
                </button>
               )}
            </div>
          </div>
          <div className="mt-16 pt-10 border-t border-white/10 text-center text-blue-300 text-xs font-bold uppercase tracking-[0.4em]">
            &copy; 2026 AI College CMS &bull; Intelligent Learning Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, suffix, color }) {
   const colorMap = {
      blue: 'text-primary-blue bg-primary-blue/5 border-primary-blue/10',
   };
   
   return (
      <div className="glass-card p-12 rounded-[3.5rem] group relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] tranblue-x-12 -tranblue-y-12 group-hover:scale-150 transition-transform duration-700"></div>
         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border ${colorMap[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
            {icon}
         </div>
         <div className="text-6xl font-black text-text-primary mb-6 tabular-nums tracking-tighter group-hover:tranblue-x-2 transition-transform duration-500">
            {value}{suffix}
         </div>
         <div className="text-text-secondary font-black uppercase tracking-[0.2em] text-[11px]">
            {label}
         </div>
      </div>
   );
}

function Pillar({ icon, title, desc }) {
   return (
      <div className="flex flex-col items-center gap-6 group text-center">
         <div className="w-16 h-16 bg-bg-card dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-blue border border-border-color shadow-lg group-hover:scale-110 group-hover:-tranblue-y-2 transition-all duration-500">
            {React.cloneElement(icon, { className: "w-7 h-7" })}
         </div>
         <div>
            <h4 className="font-black text-text-primary text-lg mb-3 tracking-tight">{title}</h4>
            <p className="text-[11px] text-text-secondary font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">{desc}</p>
         </div>
      </div>
   );
}

function TopicCard({ title, icon, description, count }) {
  return (
    <div className="bg-bg-card dark:bg-slate-800 p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden shadow-sm border border-border-color">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-blue/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-bg-tertiary dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 text-text-secondary border border-border-color group-hover:text-primary-blue group-hover:border-primary-blue/30 transition-all duration-500 shadow-sm">
         {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-text-primary mb-3 sm:mb-4 flex items-center gap-4 tracking-tight">
         {title}
         <div className="hidden xs:block h-1 flex-1 bg-border-color rounded-full overflow-hidden">
            <div className="h-full bg-primary-blue/40 w-1/4 group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
         </div>
      </h3>
      <p className="text-text-secondary text-xs sm:text-sm mb-8 sm:mb-10 leading-relaxed font-medium line-clamp-2">{description}</p>
      <div className="flex justify-between items-center relative z-10">
         <div className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">{count} Knowledge Units</div>
         <div className="p-2.5 sm:p-3 bg-primary-blue/10 rounded-xl text-primary-blue opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 shadow-lg">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
         </div>
      </div>
    </div>
  );
}

const Calendar = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default Home;
