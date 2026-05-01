import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Star, 
  Users, 
  Shield, 
  Zap,
  BookOpen,
  Calendar,
  Briefcase,
  Monitor,
  Heart
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Topics() {
  const navigate = useNavigate();
  const { posts, currentUser } = useAuth();
  const [topicStats, setTopicStats] = useState([]);

  const topicCategories = [
    {
      title: "Tech Talks",
      icon: <Monitor className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      category: "Tech",
      desc: "Hardware, software, and future tech"
    },
    {
      title: "Academic Hub",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      category: "Academic",
      desc: "Course help and study strategies"
    },
    {
      title: "Career Path",
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      category: "Career",
      desc: "Placements, internships and resumes"
    },
    {
      title: "Events & Festivals",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-600",
      category: "Events",
      desc: "What's happening on campus"
    },
    {
      title: "Community Square",
      icon: <Users className="w-6 h-6" />,
      color: "from-pink-500 to-rose-600",
      category: "Clubs",
      desc: "Clubs, activities and social life"
    },
    {
      title: "General Stream",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-blue-600 to-blue-700",
      category: "General",
      desc: "Anything and everything else"
    },
  ];

  useEffect(() => {
    if (posts) {
       const stats = topicCategories.map((topic) => ({
         ...topic,
         posts: posts.filter(
           (p) => p.category === topic.category || p.tags?.includes(topic.category)
         ).length,
       }));
       setTopicStats(stats);
    }
  }, [posts]);

  const allCategories = [
    "Tech",
    "General",
    "Announcements",
    "Clubs",
    "Events",
    "Academic",
    "Career",
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary-blue/10 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[10%] left-[-5%] w-[50%] h-[50%] bg-primary-blue/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-primary-azure/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white mb-12 p-12 rounded-[3.5rem] border border-border-color text-center relative overflow-hidden shadow-xl"
        >
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-blue/5 border border-primary-blue/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue mb-8 animate-pulse shadow-sm">
                 <Shield className="w-3.5 h-3.5" /> High-Fidelity Community Forum
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6 leading-tight tracking-tight">
                Connect. Discuss. <br />
                <span className="text-primary-blue">Transform Ideas.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-slate-600 text-lg font-medium mb-10 leading-relaxed">
                Step into the campus neural network where students and experts share knowledge across {allCategories.length} intelligence nodes.
              </p>
              <button
                onClick={() => navigate("/feed")}
                className="px-10 py-4 bg-gradient-to-r from-primary-navy to-primary-blue hover:scale-105 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto group"
              >
                Enter Discussion Stream <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
               <h2 className="text-3xl font-black text-text-primary flex items-center gap-4">
                 Top Nodes
                 <div className="h-px w-20 bg-primary-blue/20 hidden sm:block"></div>
               </h2>
               <p className="text-slate-600 font-bold uppercase tracking-widest text-[9px] mt-1">Sift through specialized intelligence channels</p>
            </div>
            <div className="px-6 py-2 bg-white border border-border-color rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-3 shadow-sm">
               <TrendingUp className="w-4 h-4 text-emerald-500" /> {posts.length} Active Streams
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
            {topicStats.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-bg-card dark:bg-slate-800 p-10 rounded-[2.5rem] border border-border-color hover:border-primary-blue/30 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full shadow-xl hover:shadow-2xl"
                onClick={() => navigate("/feed")}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity`}></div>
                
                <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${topic.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                  {topic.icon}
                </div>
                
                <h3 className="text-2xl font-black text-text-primary mb-2 tracking-tight group-hover:text-primary-blue transition-colors">
                  {topic.title}
                </h3>
                <p className="text-slate-600 font-medium text-sm mb-auto group-hover:text-primary-navy transition-colors">
                  {topic.desc}
                </p>
                
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-blue-50">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-primary-blue uppercase tracking-widest bg-primary-blue/5 px-3 py-1 rounded-lg border border-primary-blue/10">
                        {topic.posts} Active
                     </span>
                  </div>
                  <div className="text-slate-600 group-hover:text-primary-blue transition-all transform group-hover:translate-x-2">
                     <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Full Directory */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-card dark:bg-slate-800 p-12 rounded-[3.5rem] border border-border-color shadow-xl"
        >
          <div className="flex items-center gap-4 mb-10">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-border-color">
                <Users className="w-6 h-6 text-slate-600" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Full Node Directory</h2>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5 whitespace-nowrap">Access every sector of the community knowledge base</p>
             </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allCategories.map((category, idx) => {
              const categoryPosts = posts.filter(p => p.category === category);
              return (
                <button
                  key={category}
                  onClick={() => navigate("/feed")}
                  className="group flex items-center justify-between p-6 bg-blue-50 hover:bg-white hover:shadow-xl border border-border-color hover:border-primary-blue/30 rounded-2xl transition-all active:scale-95 text-left h-full"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-black text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all border border-border-color shadow-sm">
                       {category[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-text-primary text-sm group-hover:text-primary-blue transition-colors">{category}</div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                        {categoryPosts.length} Streams
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary-blue transition-all transform group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Global CTA */}
        {!currentUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 bg-white p-12 rounded-[3.5rem] border border-primary-blue/20 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/5 to-primary-azure/5 opacity-50 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-blue/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary-blue mb-6 border border-primary-blue/10 shadow-sm">
                     <Users className="w-3.5 h-3.5" /> High Network Access
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-4 tracking-tight leading-tight">Elevate Your Presence.</h2>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed opacity-80">
                    Synchronize with our academic network to start participating in deep discussions.
                  </p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <button
                    onClick={() => navigate("/signup")}
                    className="px-10 py-4 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                 >
                    <Zap className="w-4 h-4 fill-current" /> Initialize Sequence
                 </button>
                 <button
                    onClick={() => navigate("/login")}
                    className="px-10 py-4 bg-white border border-border-color text-text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-blue-50 shadow-sm active:scale-95 flex items-center justify-center gap-3"
                 >
                    <Shield className="w-4 h-4" /> Authenticate
                 </button>
               </div>
            </div>
          </motion.div>
        )}
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

const ChevronRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default Topics;
