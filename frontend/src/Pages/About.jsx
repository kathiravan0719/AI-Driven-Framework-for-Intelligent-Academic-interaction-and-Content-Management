import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, MessageCircle, Target, Sparkles, Heart, Shield,
  Mail, MapPin, Clock, ArrowRight, Zap, Bot, GraduationCap
} from "lucide-react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const teamMembers = [
  { name: "Dr. Sarah Johnson", role: "Scientific Advisor", avatar: "ðŸ§¬", description: "Professor of Artificial Intelligence & Neural Systems" },
  { name: "Alex Chen", role: "Network Architect", avatar: "âš¡", description: "Lead Developer & System Engineering Lead" },
  { name: "Priya Sharma", role: "UX Researcher", avatar: "ðŸŽ¨", description: "Designer & Academic Content Strategist" },
  { name: "Michael Brown", role: "Core Lead", avatar: "ðŸ§ ", description: "Senior Developer focusing on RAG Pipeline Safety" },
];

const features = [
  { icon: <Zap className="w-6 h-6" />, title: "Neural Discussions", description: "Engage in highly contextual conversations powered by campus-wide intelligence", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { icon: <GraduationCap className="w-6 h-6" />, title: "Academic Synergy", description: "Connect with students & professors to build a unified learning network", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { icon: <Bot className="w-6 h-6" />, title: "RAG Assistance", description: "Real-time AI support trained on verified university document repositories", color: "bg-blue-500/10 text-slate-600 border-blue-500/20" },
  { icon: <Sparkles className="w-6 h-6" />, title: "Knowledge Nodes", description: "Discover specific topics from academics to cutting-edge research", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { icon: <Heart className="w-6 h-6" />, title: "Community Pulse", description: "A thriving support system where peer-to-peer learning is prioritized", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { icon: <Shield className="w-6 h-6" />, title: "Protocol Safety", description: "Secure and moderated environment ensuring high-fidelity academic discourse", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
];

function About() {
  const navigate = useNavigate();
  const { posts, users, currentUser } = useAuth();
  const [stats, setStats] = useState([
    { label: "Active Scholars", value: "0" },
    { label: "Intelligence Nodes", value: "0" },
    { label: "Knowledge Streams", value: "0" },
    { label: "Daily Syncs", value: "0" },
  ]);

  useEffect(() => {
    const activeToday = users.filter((u) => {
      const lastActive = new Date(u.lastActive || Date.now());
      const today = new Date();
      return lastActive.toDateString() === today.toDateString();
    }).length;

    const uniqueTopics = new Set();
    posts.forEach((post) => {
      if (post.category) uniqueTopics.add(post.category);
      if (post.tags) post.tags.forEach((tag) => uniqueTopics.add(tag));
    });

    setStats([
      { label: "Active Scholars", value: `${users.length}+` },
      { label: "Knowledge Streams", value: `${posts.length}+` },
      { label: "Intelligence Nodes", value: `${uniqueTopics.size}+` },
      { label: "Daily Net Syncs", value: `${activeToday || Math.floor(users.length * 0.3)}+` },
    ]);
  }, [posts, users]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary-blue/10 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[10%] left-[-5%] w-[60%] h-[60%] bg-primary-blue/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[50%] h-[50%] bg-primary-azure/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-primary-blue/5 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-blue/5 border border-primary-blue/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue mb-8 shadow-sm"
          >
             <Sparkles className="w-4 h-4" /> The Intelligent Learning Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-text-primary mb-8 tracking-tight leading-tight"
          >
            Decoding the <br />
            <span className="text-primary-blue">Campus Experience.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            AI College CMS is a high-fidelity digital ecosystem designed to connect scholars, optimize resource distribution, and foster deep intellectual collaboration.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border-color text-center group hover:border-primary-blue/30 transition-all duration-500 shadow-xl"
            >
              <div className="text-4xl font-black text-text-primary mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mission Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-bg-card dark:bg-slate-800 p-16 rounded-[3.5rem] border border-primary-blue/10 shadow-2xl mb-24 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-primary-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary-blue/20 shadow-sm">
               <Target className="w-8 h-8 text-primary-blue" />
            </div>
            <h2 className="text-3xl font-black text-text-primary mb-6 tracking-tight uppercase tracking-[0.1em]">Strategic Objective</h2>
            <p className="text-2xl font-bold text-slate-600 leading-relaxed max-w-4xl mx-auto italic">
              "To create an inclusive, intelligence-driven architecture where every student interaction builds a stronger, more resilient campus community."
            </p>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="mb-24">
          <div className="flex flex-col items-center mb-16 text-center">
             <h2 className="text-4xl font-black text-text-primary mb-4 tracking-tight">Core Module Synergy</h2>
             <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">What we deliver to the campus network</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color hover:border-primary-blue/30 hover:shadow-2xl transition-all group shadow-xl"
              >
                <div className={`w-14 h-14 ${feature.color.replace('bg-indigo-500/10', 'bg-blue-50').replace('text-indigo-400', 'text-primary-blue').replace('border-indigo-500/20', 'border-border-color')} border rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight uppercase tracking-wider">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-loose font-medium">{feature.description}</p>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center">
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
           >
              <div>
                 <h2 className="text-4xl font-black text-text-primary mb-6 leading-tight">Neural Origins.</h2>
                 <div className="w-20 h-1.5 bg-primary-blue rounded-full shadow-lg"></div>
              </div>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-medium">
                 <p>
                    Established in 2022, AI College CMS originated from a mission to break the silos of academic communication. What began as a localized knowledge node has expanded into a massive intelligence network.
                 </p>
                 <p>
                    Today, we facilitate over <span className="text-primary-blue font-black">{posts.length}+ active streams</span> across the platform, connecting <span className="text-primary-navy font-black font-inter tracking-tight">{users.length} authenticated scholars</span> in a unified pursuit of excellence.
                 </p>
                 <p>
                    Our architecture continues to adapt, integrating RAG-based AI and semantic discovery to ensure your academic path is always supported by the collective intelligence of the campus.
                 </p>
              </div>
           </motion.div>
           
           <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-bg-card dark:bg-slate-800 p-10 rounded-[4rem] border border-border-color shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                 <Users className="w-5 h-5 text-primary-blue" /> Executive Node (Team)
              </h3>
              <div className="space-y-8">
                 {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-6 group/member">
                       <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl border border-border-color group-hover/member:bg-primary-blue group-hover/member:text-white transition-all duration-500 shadow-sm">
                          {member.avatar}
                       </div>
                       <div>
                          <div className="font-black text-text-primary group-hover/member:text-primary-blue transition-colors">{member.name}</div>
                          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{member.role}</div>
                          <div className="text-[9px] font-bold text-slate-600 line-clamp-1">{member.description}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
        </div>

        {/* Contact Section â€” Dynamic: shows only logged-in user's info */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-bg-card dark:bg-slate-800 p-16 rounded-[4rem] border border-primary-blue/10 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/5 to-primary-azure/5 opacity-50 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-blue/5 border border-primary-blue/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary-blue mb-8 shadow-sm">
                <Mail className="w-4 h-4" /> Uplink Terminal
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-6 tracking-tight">Establish Connection.</h2>
             <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-2xl mb-12 opacity-80">
                Have inquiries or feedback regarding the platform protocol? Our support nodes are ready to synchronize.
             </p>

             <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
                {[
                  { icon: <Mail className="w-5 h-5" />, label: 'Neural Relay', val: 'forum@college.edu' },
                  { icon: <MapPin className="w-5 h-5" />, label: 'Physical Sector', val: 'Student Center, R-204' },
                  { icon: <Clock className="w-5 h-5" />, label: 'Active Cycle', val: 'Mon-Fri, 9AM-5PM' }
                ].map(item => (
                  <div key={item.label} className="p-6 bg-blue-50 border border-border-color rounded-2xl group hover:bg-white hover:shadow-xl hover:border-primary-blue/30 transition-all duration-500">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 border border-border-color text-primary-blue group-hover:scale-110 transition-transform shadow-sm">
                        {item.icon}
                     </div>
                     <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.label}</div>
                     <div className="font-black text-text-primary truncate text-sm">{item.val}</div>
                  </div>
                ))}
             </div>

             <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
               {!currentUser ? (
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-12 py-5 bg-gradient-to-r from-primary-navy to-primary-blue hover:scale-105 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    Initialize Identity <ArrowRight className="w-4 h-4 group-hover:tranblue-x-1 transition-transform" />
                  </button>
               ) : (
                  <button
                    onClick={() => navigate("/feed")}
                    className="px-12 py-5 bg-white border border-border-color text-text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-blue-50 shadow-sm active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    Enter Learning Streams <ArrowRight className="w-4 h-4 group-hover:tranblue-x-1 transition-transform" />
                  </button>
               )}
             </div>
          </div>
        </motion.div>
      </div>

      <style jsx="true">{`
        @keyframes blob {
           0% { transform: translate(0px, 0px) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
           animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default About;
