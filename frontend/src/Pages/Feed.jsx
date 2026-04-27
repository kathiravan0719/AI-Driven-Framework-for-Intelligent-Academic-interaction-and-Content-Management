import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Heart, 
  X, 
  Filter, 
  ChevronRight,
  Sparkles,
  User,
  Clock,
  ArrowRight,
  Cpu
} from "lucide-react";

const CATEGORIES = ["Tech", "General", "Announcements", "Clubs", "Events", "Academic", "Career"];

export default function Feed() {
  const navigate = useNavigate();
  const { posts, currentUser, createPost, likePost } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await createPost({ title, content, category, userId: currentUser.id, authorName: currentUser.name });
      setTitle(""); setContent(""); setCategory("General"); setShowForm(false);
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (posts || []).filter((p) => {
    if (!p) return false;
    const matchSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-slate-900 text-text-primary selection:bg-primary-blue/20 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] bg-primary-blue/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-primary-azure/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:px-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-border-color text-primary-blue text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
              <Sparkles className="w-4 h-4 text-primary-azure" />
              Community Knowledge Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-primary">
              Discussion <span className="gradient-text drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]">Feed.</span>
            </h1>
            <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-[11px] ml-1">Connect, share, and evolve with your fellow scholars.</p>
          </div>
          {currentUser && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`group flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl border ${
                showForm 
                ? "bg-white border-border-color text-slate-600 hover:bg-blue-50" 
                : "bg-gradient-to-r from-primary-navy via-primary-blue to-primary-azure text-white shadow-primary-blue/30"
              }`}
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5" /> 
                  Discard Input
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                  Initialize Post
                </>
              )}
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] sticky top-32 border border-border-color shadow-xl group">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-10 border-b border-border-color pb-6">
                <Filter className="w-5 h-5 text-primary-blue" />
                Sector Filters
              </div>
              <div className="flex flex-col gap-3">
                {["All", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-between group/btn border ${
                      activeCategory === c
                      ? "bg-primary-blue text-white border-primary-blue shadow-lg shadow-primary-blue/20"
                      : "text-slate-600 border-transparent hover:bg-blue-50 hover:text-primary-navy"
                    }`}
                  >
                    {c}
                    <div className={`p-1.5 rounded-lg transition-all ${activeCategory === c ? "bg-white/20 text-white" : "bg-primary-blue/10 text-primary-blue opacity-0 scale-50 group-hover/btn:opacity-100 group-hover/btn:scale-100"}`}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-primary-blue/5 p-10 rounded-[3rem] border border-primary-blue/10 shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Cpu className="w-10 h-10 text-primary-azure mb-8" />
               <h4 className="font-black text-text-primary text-base mb-3 tracking-tighter uppercase">Neural Propagation</h4>
               <p className="text-slate-600 text-[10px] leading-relaxed font-bold uppercase tracking-[0.2em]">
                  Your insights are analyzed and propagated across the campus knowledge lattice in real-time.
               </p>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-10">
            <AnimatePresence>
              {showForm && currentUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="overflow-hidden"
                >
                  <div className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3.5rem] border border-primary-blue/20 mb-10 bg-gradient-to-br from-primary-blue/5 to-transparent shadow-xl">
                    <h2 className="text-2xl font-black mb-8 text-text-primary tracking-tighter uppercase">Initialize Signal Source</h2>
                    <form onSubmit={handleCreatePost} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Post Title</label>
                        <input
                          type="text"
                          placeholder="What's evolving in your domain?"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-blue-50 border border-border-color rounded-2xl px-6 py-4 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-bold text-lg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Discussion Body</label>
                        <textarea
                          placeholder="Deep dive into the neural patterns..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={6}
                          className="w-full bg-blue-50 border border-border-color rounded-3xl px-6 py-5 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all resize-none leading-relaxed font-bold"
                          required
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                        <div className="w-full sm:w-auto relative group">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full sm:w-auto bg-blue-100 border border-border-color rounded-xl px-6 py-3.5 text-[10px] font-black text-slate-600 hover:text-primary-blue uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all appearance-none cursor-pointer pr-12 shadow-sm"
                          >
                            {CATEGORIES.map((c) => <option key={c} className="bg-white">{c}</option>)}
                          </select>
                          <div className="absolute right-5 top-1/2 -tranblue-y-1/2 pointer-events-none text-slate-600 group-hover:text-primary-blue transition-colors">
                            <Filter className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="group w-full sm:w-auto sm:ml-auto px-10 py-5 bg-gradient-to-r from-primary-navy via-primary-blue to-primary-azure text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 border border-white/10"
                        >
                          {submitting ? <div className="flex items-center gap-3 animate-pulse"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Propagating...</div> : <>Transmit Source <ArrowRight className="w-5 h-5 group-hover:tranblue-x-1 transition-transform" /></>}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group mb-16 shadow-2xl rounded-[2.5rem]">
              <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                 <Search className="w-6 h-6 text-slate-600 transition-colors group-focus-within:text-primary-blue" />
              </div>
              <input
                type="text"
                placeholder="Search knowledge streams by keyword or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-24 bg-white border-2 border-border-color rounded-[2.5rem] pl-20 pr-8 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue/20 transition-all text-xl font-black tracking-tight shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -tranblue-y-1/2 flex items-center gap-4">
                 <div className="h-10 w-px bg-blue-100"></div>
                 <div className="px-4 py-2 bg-primary-blue/5 rounded-xl text-[10px] font-black text-primary-blue uppercase tracking-widest border border-primary-blue/10 mr-4">Neural Scanner Active</div>
              </div>
            </div>

            <div className="space-y-10">
              {filtered.length > 0 ? (
                filtered.map((post, idx) => (
                  <motion.div
                    key={post._id || post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate(`/post/${post._id || post.id}`)}
                    className="bg-bg-card dark:bg-slate-800 p-12 rounded-[3.5rem] cursor-pointer transition-all hover:bg-blue-50 group border border-border-color relative overflow-hidden shadow-xl group/card"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight className="w-8 h-8 text-primary-blue -tranblue-x-10 group-hover:tranblue-x-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </div>

                    <div className="flex items-center gap-6 mb-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary-blue rounded-[1.8rem] blur-2xl opacity-10 transition-all group-hover/card:opacity-30"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-primary-navy via-primary-blue to-primary-azure rounded-[1.8rem] border border-border-color flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover/card:scale-110 transition-transform duration-700">
                         {(String(post.authorName || post.userId?.name || "U")).charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="font-black text-text-primary text-xl tracking-tight mb-2 group-hover:text-primary-blue transition-colors">
                          {post.authorName || post.userId?.name || "Unknown Scholar"}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">
                          <Clock className="w-4 h-4 text-primary-azure" />
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now"}
                        </div>
                      </div>
                      <div className={`ml-auto px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-xl backdrop-blur-md ${
                        post.category === 'Announcements' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        post.category === 'Events' ? 'bg-primary-azure/10 text-primary-azure border-primary-azure/20' :
                        'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                      }`}>
                        {post.category || "General Source"}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-text-primary mb-5 group-hover:tranblue-x-2 transition-transform tracking-tighter leading-tight">{post.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 font-bold mb-10 uppercase tracking-[0.2em]">
                       {post.content}
                    </p>

                     <div className="flex items-center gap-12 pt-10 border-t border-border-color group-hover:border-border-color transition-colors">
                      <button
                        onClick={(e) => { e.stopPropagation(); likePost(post._id || post.id); }}
                        className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-rose-500 transition-all group/like"
                      >
                        <div className={`p-2.5 bg-blue-50 rounded-xl border border-border-color transition-all group-active/like:scale-150 group-hover/like:bg-rose-500/10 group-hover/like:border-rose-500/20 ${post.likedBy?.includes(currentUser?.id) ? "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.2)]" : ""}`}>
                          <Heart className={`w-5 h-5 ${post.likedBy?.includes(currentUser?.id) ? "fill-rose-500" : ""}`} />
                        </div>
                        <span>{post.likedBy?.length || post.likes || 0} Positive Signals</span>
                      </button>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600 group/comm">
                        <div className="p-2.5 bg-blue-50 rounded-xl border border-border-color group-hover/comm:bg-primary-blue/10 group-hover/comm:border-primary-blue/20 group-hover/comm:text-primary-blue transition-all">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span>{post.comments?.length || 0} Neural Echoes</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-bg-card dark:bg-slate-800 p-32 rounded-[4rem] text-center border border-border-color shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-border-color shadow-lg">
                    <MessageSquare className="w-10 h-10 text-slate-500 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tighter uppercase">The silence is curious.</h3>
                  <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No knowledge streams found matching your neural filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
