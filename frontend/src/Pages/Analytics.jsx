import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  TrendingUp, Users, MessageCircle, Eye, ThumbsUp, 
  BarChart3, Activity, PieChart, Shield, Zap, Sparkles, ChevronRight
} from "lucide-react";

function Analytics() {
  const navigate = useNavigate();
  const { posts, users, currentUser } = useAuth();

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const stats = {
    totalViews: posts.length * 15,
    activeUsers: users.length,
    totalPosts: posts.length,
    engagementRate: 65,
    totalLikes: posts.reduce((sum, p) => sum + (p.likedBy?.length || p.likes || 0), 0),
    totalComments: posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
  };

  const categoryData = {};
  posts.forEach((post) => {
    categoryData[post.category] = (categoryData[post.category] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary-blue/10 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-blue/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] bg-primary-azure/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-12 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 shadow-sm"
          >
             <Activity className="w-3.5 h-3.5" /> Intelligence Signal: Active
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-text-primary mb-2 tracking-tight leading-tight"
          >
            Network <span className="text-primary-blue">Analytics.</span>
          </motion.h1>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] ml-1">Real-time performance metrics of the campus neural net</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <MetricCard
            title="Intelligence Reach"
            value={stats.totalViews.toLocaleString()}
            icon={<Eye className="w-6 h-6" />}
            color="bg-primary-blue/5 text-primary-blue"
            trend="+12%"
            delay={0.1}
          />
          <MetricCard
            title="Scholar Density"
            value={stats.activeUsers}
            icon={<Users className="w-6 h-6" />}
            color="bg-primary-azure/5 text-primary-azure"
            trend="+8%"
            delay={0.2}
          />
          <MetricCard
            title="Knowledge Streams"
            value={stats.totalPosts}
            icon={<MessageCircle className="w-6 h-6" />}
            color="bg-emerald-50 text-emerald-600"
            trend="+15%"
            delay={0.3}
          />
          <MetricCard
            title="Core Engagement"
            value={`${stats.engagementRate}%`}
            icon={<Zap className="w-6 h-6" />}
            color="bg-amber-50 text-amber-600"
            trend="+5%"
            delay={0.4}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Visual Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-border-color relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 left-0 w-80 h-80 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                     <BarChart3 className="w-4 h-4 text-primary-blue" /> Platform Throughput
                  </h3>
                  <div className="flex gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Syncing</span>
                  </div>
               </div>
               
               <div className="grid md:grid-cols-3 gap-8 py-10">
                  {[
                    { label: 'Total Streams', val: stats.totalPosts, color: 'text-primary-navy', bg: 'bg-primary-navy/5' },
                    { label: 'Neural Echoes', val: stats.totalComments, color: 'text-primary-blue', bg: 'bg-primary-blue/5' },
                    { label: 'Positive Signal', val: stats.totalLikes, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                  ].map(item => (
                    <div key={item.label} className="text-center group/item hover:scale-105 transition-transform duration-500">
                       <div className={`w-20 h-20 ${item.bg} rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border-color shadow-sm`}>
                          <div className={`text-4xl font-black ${item.color}`}>{item.val}</div>
                       </div>
                       <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</div>
                    </div>
                  ))}
               </div>
               
               <div className="w-full h-40 flex items-end gap-1 px-4 opacity-70 mt-4">
                  {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 55, 98].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }} 
                      transition={{ delay: 0.6 + (i * 0.05), duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-primary-blue/10 to-primary-blue/30 rounded-t-lg"
                    />
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Node Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-border-color shadow-xl"
          >
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
               <PieChart className="w-4 h-4 text-primary-azure" /> Sector Mapping
            </h3>
            <div className="space-y-8">
              {Object.entries(categoryData).map(([category, count], idx) => (
                <div key={category} className="group">
                  <div className="flex justify-between mb-3 items-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{category || 'General'}</span>
                    <span className="text-[10px] font-black text-primary-blue">
                      {((count / stats.totalPosts) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-50 rounded-full h-1.5 relative overflow-hidden border border-border-color shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.totalPosts) * 100}%` }}
                      transition={{ delay: 0.7 + (idx * 0.1), duration: 1 }}
                      className="absolute inset-y-0 left-0 bg-primary-blue rounded-full shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Streams */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color shadow-xl"
        >
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500" /> High-Performance Streams
             </h3>
             <button onClick={() => navigate('/feed')} className="text-[10px] font-black text-slate-600 hover:text-primary-blue transition-colors uppercase tracking-widest flex items-center gap-2">
                Open All <ChevronRight className="w-3 h-3" />
             </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {posts
              .sort((a, b) => (b.likedBy?.length || b.likes || 0) + (b.comments?.length || 0) - ((a.likedBy?.length || a.likes || 0) + (a.comments?.length || 0)))
              .slice(0, 4)
              .map((post, index) => (
                <div
                  key={post._id || post.id}
                  className="flex items-center justify-between p-6 bg-blue-50 hover:bg-white hover:shadow-xl border border-border-color rounded-3xl cursor-pointer transition-all group"
                  onClick={() => navigate(`/post/${post._id || post.id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-blue text-white rounded-2xl flex items-center justify-center text-xl font-black border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-black text-text-primary group-hover:text-primary-blue transition-colors">{post.title}</div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                        {post.category || 'Node'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-primary-blue/70 group-hover:text-primary-blue bg-primary-blue/5 px-3 py-1 rounded-lg transition-colors border border-primary-blue/10">
                    {(post.likedBy?.length || post.likes || 0) + (post.comments?.length || 0)} Interactions
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, trend, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border-color relative group cursor-default shadow-xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className={`p-3.5 rounded-2xl ${color} border border-blue-50 group-hover:rotate-6 transition-transform duration-500 shadow-sm`}>{icon}</div>
        <div className="flex flex-col items-end">
           <span className="text-emerald-500 text-xs font-black tracking-widest">{trend}</span>
           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Growth</span>
        </div>
      </div>
      <div className="text-3xl font-black text-text-primary mb-2 font-inter tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</div>
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{title}</div>
    </motion.div>
  );
}

export default Analytics;
