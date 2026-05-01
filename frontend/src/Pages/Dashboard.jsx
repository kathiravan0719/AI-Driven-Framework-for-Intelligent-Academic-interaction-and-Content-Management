import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, MessageSquare, TrendingUp,
  Shield, Trash2, Eye, BarChart3, Heart, Clock,
  FileText, AlertTriangle, CheckCircle, Award, Sparkles, ChevronRight, Cpu
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, posts, users, refreshPosts } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    calculateStats();
  }, [currentUser, navigate, posts, users]);

  const calculateStats = () => {
    const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)), 0);
    setStats({ totalUsers: users.length, totalPosts: posts.length, totalComments, totalLikes });
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      showToast("Sync termination successful");
      refreshPosts();
    } catch {
      showToast("Critical error during deletion", false);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await api.delete(`/content/${contentId}`);
      showToast("Source removed successfully");
    } catch {
      showToast("Action failed in core terminal", false);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-slate-900 selection:bg-primary-blue/10 overflow-x-hidden">
      <Header />

      {/* Subtle Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[10%] left-[-5%] w-[60%] h-[60%] bg-primary-blue/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[50%] h-[50%] bg-primary-azure/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Neural Toast */}
      <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`fixed top-24 right-6 z-[100] px-8 py-5 rounded-2xl shadow-2xl backdrop-blur-2xl border font-black flex items-center gap-4 ${toast.ok ? 'bg-white/90 border-emerald-100 text-emerald-600' : 'bg-white/90 border-rose-100 text-rose-600'}`}
        >
          <div className={`p-2 rounded-xl border ${toast.ok ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
             {toast.ok ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <span className="tracking-tight text-sm uppercase">{toast.msg}</span>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Protocol Override (Modal) */}
      <AnimatePresence>
      {deleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-navy/20 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white p-12 rounded-[3.5rem] border border-blue-100 max-w-md w-full shadow-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-24 h-24 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl">
              <AlertTriangle className="w-12 h-12 text-rose-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tighter uppercase">Confirm Deletion</h3>
            <p className="text-slate-600 text-center mb-12 leading-relaxed font-bold uppercase tracking-widest text-[10px]">
              CRITICAL: Are you sure you want to terminate this {deleteConfirm.type}? This operation cannot be reversed in the neural network.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-8 py-5 bg-blue-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-blue-100 hover:bg-blue-100 transition shadow-sm"
              >
                Abort
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'post') handleDeletePost(deleteConfirm.id);
                  else handleDeleteContent(deleteConfirm.id);
                }}
                className="flex-1 px-8 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-rose-500 transition flex items-center justify-center gap-3 border border-white/10 active:scale-95"
              >
                Terminate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Profile Signal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary-blue/5 border border-primary-blue/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary-blue shadow-sm">
               <Cpu className="w-4 h-4 animate-pulse" /> Core System Terminal
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
               User <span className="text-primary-blue">Dashboard.</span>
            </h1>
            <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-3 ml-1">
               Welcome back, <span className="text-primary-blue animate-pulse">{currentUser?.name}</span>
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/chat')} className="p-5 bg-white border border-blue-100 rounded-3xl text-slate-600 hover:text-primary-blue hover:border-primary-blue/20 transition-all group shadow-xl">
                <MessageSquare className="w-7 h-7 group-hover:scale-110 transition-transform" />
             </button>
             <button onClick={() => navigate(`/profile/${currentUser?.id}`)} className="p-5 bg-white border border-blue-100 rounded-3xl text-slate-600 hover:text-primary-blue hover:border-primary-blue/20 transition-all group shadow-xl">
                <Users className="w-7 h-7 group-hover:scale-110 transition-transform" />
             </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <StatCard title="Active Network Users" value={stats.totalUsers} icon={<Users className="w-7 h-7" />} color="bg-primary-blue/5 text-primary-blue border-primary-blue/10" delay={0.1} />
          <StatCard title="Knowledge Streams" value={stats.totalPosts} icon={<FileText className="w-7 h-7" />} color="bg-emerald-50 text-emerald-500 border-emerald-100" delay={0.2} />
          <StatCard title="Neural Echoes" value={stats.totalComments} icon={<MessageSquare className="w-7 h-7" />} color="bg-primary-azure/10 text-primary-azure border-primary-azure/20" delay={0.3} />
          <StatCard title="Positive Signals" value={stats.totalLikes} icon={<Heart className="w-7 h-7" />} color="bg-rose-50 text-rose-500 border-rose-100" delay={0.4} />
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="bg-white rounded-[3rem] border border-blue-100 p-2 mb-16 inline-flex items-center gap-2 shadow-xl relative group overflow-hidden">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
          <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")} icon={<MessageSquare className="w-4 h-4" />} label="My Content" />
          <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={<BarChart3 className="w-4 h-4" />} label="Engagement" />
        </div>

        {/* Tab Content Rendering */}
        <div className="min-h-[600px] relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <OverviewTab stats={stats} posts={posts} users={users} />
              </motion.div>
            )}
            {activeTab === "posts" && (
              <motion.div key="posts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <PostsTab posts={posts.filter(p => (p.userId?._id || p.userId) === currentUser?.id)} users={users} onDelete={(id) => setDeleteConfirm({ id, type: 'post' })} navigate={navigate} />
              </motion.div>
            )}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <AnalyticsTab posts={posts} users={users} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 z-10 border ${
        active 
          ? "bg-gradient-to-r from-primary-navy to-primary-blue text-white shadow-xl border-white/10" 
          : "text-slate-600 hover:text-slate-600 border-transparent hover:bg-blue-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function OverviewTab({ stats, posts, users }) {
  const navigate = useNavigate();
  return (
    <div className="grid lg:grid-cols-3 gap-10 items-start">
      <div className="lg:col-span-2 space-y-10">
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-12 rounded-[3.5rem] border border-blue-100 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary-blue" /> Recent Learning Activity
             </h3>
             <button onClick={() => navigate('/feed')} className="text-[10px] font-black text-primary-blue flex items-center gap-2 group/btn uppercase tracking-widest hover:text-primary-navy transition-colors">
                Network Feed <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
             </button>
          </div>
          <div className="space-y-5">
            {posts.slice(0, 5).map((post) => {
              const user = users.find((u) => (u._id || u.id) === (post.userId?._id || post.userId));
              return (
                <div key={post._id || post.id} className="flex items-center justify-between p-6 bg-blue-50 border border-blue-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all group/item">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-navy to-primary-blue rounded-2xl flex items-center justify-center text-white font-black text-base border border-white/10 group-hover/item:scale-110 transition-transform shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-base tracking-tight mb-1 group-hover/item:text-primary-blue transition-colors">{post.title}</div>
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">Signal source: <span className="text-slate-600">{user?.name || "Anonymous Scholar"}</span></div>
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white border border-blue-100 px-4 py-2 rounded-xl group-hover/item:bg-blue-50 transition-colors">
                    {new Date(post.timestamp || post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            {posts.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center justify-center opacity-30">
                 <Sparkles className="w-16 h-16 mb-6 text-primary-blue animate-pulse" />
                 <p className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-600">Waiting for signal activation...</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <HealthCard title="Neural Quality" score={92} status="Optimum" color="text-primary-blue" delay={0.5} />
          <HealthCard title="Uptime Rating" score={99} status="Stable" color="text-emerald-500" delay={0.6} />
          <HealthCard title="Moderation Protocol" score={95} status="Active" color="text-primary-azure" delay={0.7} />
        </div>
      </div>

      <div className="space-y-10">
         <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-12 rounded-[3.5rem] border border-primary-blue/10 shadow-xl relative overflow-hidden text-center group"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
               <div className="w-24 h-24 bg-primary-blue/5 border border-primary-blue/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg group-hover:scale-110 transition-transform duration-700">
                  <Award className="w-12 h-12 text-primary-blue" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Achievement Node</h3>
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed mb-10">
                  Your platform contribution level is exceptionally high. Proceed with further scholarship nodes.
               </p>
               <div className="px-8 py-4 bg-primary-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-blue/20">
                  Level 14 Authorized
               </div>
            </div>
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl"
         >
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
               <TrendingUp className="w-6 h-6 text-primary-azure" /> Daily Signal Flux
            </h3>
            <div className="space-y-8">
               {[
                 { label: 'Network Requests', val: '2.4k', progress: 75, color: 'bg-primary-navy' },
                 { label: 'Data Exchange', val: '840mb', progress: 45, color: 'bg-primary-blue' },
                 { label: 'Neural Accuracy', val: '98.2%', progress: 98, color: 'bg-emerald-500' }
               ].map(item => (
                 <div key={item.label} className="group/progress">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] group-hover/progress:text-slate-600 transition-colors">{item.label}</span>
                       <span className="text-[9px] font-black text-slate-900 group-hover/progress:scale-110 transition-transform">{item.val}</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2 relative overflow-hidden border border-blue-200 shadow-inner">
                       <div className={`absolute inset-y-0 left-0 ${item.color} rounded-full`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </motion.div>
      </div>
    </div>
  );
}

function PostsTab({ posts, users, onDelete, navigate }) {
  return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl animate-fadeIn">
      <div className="flex items-center justify-between mb-12">
         <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
            <FileText className="w-6 h-6 text-primary-blue" /> User Authored Content ({posts.length})
         </h3>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {posts.map((post) => {
          const user = users.find((u) => (u._id || u.id) === (post.userId?._id || post.userId));
          return (
             <div key={post._id || post.id} className="p-8 bg-blue-50 border border-blue-100 rounded-[3rem] hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group/card">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-navy to-primary-blue rounded-[1.8rem] flex items-center justify-center text-white font-black text-lg border border-white/10 group-hover/card:scale-110 transition-transform duration-700 shadow-xl">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tighter mb-1.5 group-hover/card:text-primary-blue transition-colors uppercase">{post.title}</h3>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">{post.category || 'Standard Node'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/post/${post._id || post.id}`)} className="p-3.5 bg-white text-slate-600 rounded-2xl hover:text-primary-blue transition-all border border-blue-100 shadow-sm active:scale-90">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(post._id || post.id)} className="p-3.5 bg-white text-slate-600 rounded-2xl hover:text-rose-500 transition-all border border-blue-100 shadow-sm active:scale-90">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 font-bold uppercase tracking-widest text-[10px] opacity-70 group-hover/card:opacity-100 transition-opacity">{post.content}</p>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <span className="flex items-center gap-2 group/stat">
                      <Heart className="w-4 h-4 text-rose-400 group-hover/stat:text-rose-500 transition-colors" /> {Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}
                    </span>
                    <span className="flex items-center gap-2 text-primary-blue/70 group/stat">
                      <MessageSquare className="w-4 h-4 group-hover/stat:text-primary-blue transition-colors" /> {post.comments?.length || 0}
                    </span>
                 </div>
                 <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] bg-white px-4 py-2 rounded-xl border border-blue-100">
                    {new Date(post.timestamp || post.createdAt).toLocaleDateString()}
                 </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="md:col-span-2 py-40 text-center flex flex-col items-center justify-center opacity-20">
            <FileText className="w-20 h-20 mx-auto mb-8 text-primary-blue animate-float" />
            <p className="text-sm font-black uppercase tracking-[0.5em] italic">No authorship records detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab({ posts, users }) {
  const categories = {};
  posts.forEach((post) => { categories[post.category] = (categories[post.category] || 0) + 1; });

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <motion.div 
         initial={{ opacity: 0, x: -30 }}
         animate={{ opacity: 1, x: 0 }}
         className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl"
      >
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
          <BarChart3 className="w-6 h-6 text-primary-blue" /> Academic Sector Mapping
        </h3>
        <div className="space-y-10">
          {Object.entries(categories).map(([category, count], idx) => (
            <div key={category} className="group/stat">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-600 group-hover/stat:text-slate-600 transition-colors">{category || 'Neutral Protocol'}</span>
                <span className="text-primary-blue font-black text-[10px] group-hover/stat:scale-110 transition-transform">{count} Nodes</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2.5 relative overflow-hidden border border-blue-200 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / posts.length) * 100}%` }}
                  transition={{ delay: 0.1 * idx, duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary-blue rounded-full shadow-lg"
                />
              </div>
            </div>
          ))}
          {Object.keys(categories).length === 0 && <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-center py-24 italic opacity-20">No mapping data available.</p>}
        </div>
      </motion.div>

      <motion.div 
         initial={{ opacity: 0, x: 30 }}
         animate={{ opacity: 1, x: 0 }}
         className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl"
      >
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
          <TrendingUp className="w-6 h-6 text-emerald-500" /> Synergetic Engagement
        </h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 group hover:border-primary-blue/20 transition-all duration-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full blur-[50px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter group-hover:scale-110 transition-transform">
              {posts.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)), 0)}
            </div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">Total Signals</div>
          </div>
          <div className="text-center p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 group hover:border-primary-azure/20 transition-all duration-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-azure/5 rounded-full blur-[50px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter group-hover:scale-110 transition-transform">
              {posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}
            </div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">Echo Frequency</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }) {
  return (
    <motion.div 
       initial={{ opacity: 0, y: 30 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay }}
       className={`${color} bg-white p-10 rounded-[3rem] border border-blue-100 group hover:scale-[1.03] transition-all duration-700 shadow-xl overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="p-5 rounded-2.5xl bg-white w-fit mb-8 border border-blue-100 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700 shadow-lg">{icon}</div>
      <div className="text-5xl font-black text-slate-900 mb-3 tracking-tighter group-hover:translate-x-3 transition-transform duration-500">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 group-hover:text-slate-900 transition-all">{title}</div>
    </motion.div>
  );
}

function HealthCard({ title, score, status, color, delay }) {
  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ delay }}
       className="bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-10">
        <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">{title}</span>
        <span className={`font-black text-[10px] uppercase tracking-[0.4em] ${color} animate-pulse`}>{status}</span>
      </div>
      <div className="relative">
        <div className="w-full bg-blue-100 rounded-full h-2 relative overflow-hidden border border-blue-200 shadow-inner">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${score}%` }}
             transition={{ delay: delay + 0.3, duration: 1.8, ease: "easeOut" }}
             className={`h-full rounded-full ${color.replace("text", "bg")}`}
          />
        </div>
        <div className="text-center mt-8 font-black text-4xl text-slate-900 tracking-tighter group-hover:scale-110 transition-transform duration-500">{score}%</div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
