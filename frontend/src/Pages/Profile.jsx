import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, ArrowLeft, Calendar, Mail, Shield,
  Edit3, Save, X, MessageSquare, BookOpen, Award, TrendingUp,
  User as UserIcon, Clock, Star, Sparkles, Zap, Bot, ChevronRight
} from "lucide-react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUserById, posts, onlineUsers } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [userStats, setUserStats] = useState({
    posts: 0,
    replies: 0,
    likes: 0,
  });

  const user = getUserById(id);
  const isOwnProfile = currentUser && (currentUser.id === id || currentUser._id === id);
  const isUserOnline = (onlineUsers || []).includes(id);

  useEffect(() => {
    if (id) {
      const savedProfile = localStorage.getItem(`profile_${id}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setBio(parsed.bio || "");
        setDepartment(parsed.department || "");
      }
    }
  }, [id]);

  useEffect(() => {
    if (user && posts) {
      const userPosts = posts.filter((p) => (p.userId?._id || p.userId) === id);
      const userReplies = posts.reduce((total, post) => {
        return (
          total +
          (post.comments?.filter((c) => (c.userId?._id || c.userId) === id).length || 0)
        );
      }, 0);
      const totalLikes = userPosts.reduce(
        (total, post) => total + (post.likedBy?.length || post.likes || 0),
        0
      );

      setUserStats({
        posts: userPosts.length,
        replies: userReplies,
        likes: totalLikes,
      });
    }
  }, [user, posts, id]);

  const handleSaveProfile = () => {
    localStorage.setItem(`profile_${id}`, JSON.stringify({ bio, department }));
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-border-color">
                <UserIcon className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Subject Not Found</h2>
            <p className="text-slate-600 font-medium mb-12">The requested academic profile is not indexed in the campus registry.</p>
            <button
                onClick={() => navigate("/feed")}
                className="px-8 py-3 bg-primary-blue hover:bg-primary-navy text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2 mx-auto"
            >
                <ArrowLeft className="w-5 h-5" /> Return to Hub
            </button>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter((p) => (p.userId?._id || p.userId) === id);
  const userReplies = [];
  posts.forEach((post) => {
    post.comments?.forEach((comment) => {
      if ((comment.userId?._id || comment.userId) === id) {
        userReplies.push({
          ...comment,
          postTitle: post.title,
          postId: post._id || post.id,
        });
      }
    });
  });

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently Joined';

  const tabs = [
    { key: 'posts', label: 'Posts', count: userStats.posts, icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'replies', label: 'Replies', count: userStats.replies, icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'about', label: 'About', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-slate-900 text-text-primary selection:bg-primary-blue/20 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary-blue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary-azure/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/feed")}
          className="mb-8 group flex items-center gap-2 text-slate-600 hover:text-primary-blue transition-all font-bold uppercase tracking-widest text-[10px]"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border-color group-hover:bg-primary-blue group-hover:border-primary-blue group-hover:text-white transition-all shadow-sm">
             <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Hub
        </motion.button>

        {/* Profile Card */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color shadow-xl relative overflow-hidden mb-12"
        >
           {/* Visual Decor */}
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Avatar Section */}
              <div className="relative group">
                 <div className="absolute inset-0 bg-primary-blue rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                 <div className="relative w-36 h-36 bg-gradient-to-br from-primary-navy to-primary-blue rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl border border-border-color group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    {user.name?.charAt(0).toUpperCase()}
                    {isUserOnline && (
                      <div className="absolute bottom-3 right-3 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    )}
                 </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left space-y-4">
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight mb-2 leading-tight">
                       {user.name}
                    </h1>
                    <p className="text-slate-600 font-medium text-lg opacity-80">{user.email}</p>
                 </div>

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-primary-blue/10 border border-primary-blue/20 text-primary-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                       <Shield className="w-3.5 h-3.5" /> {user.role || "Scholar"}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-border-color text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                       <Calendar className="w-3.5 h-3.5" /> {joinDate}
                    </span>
                    {isUserOnline && (
                      <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                         <Zap className="w-3.5 h-3.5" /> Live Signal
                      </span>
                    )}
                 </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                 {isOwnProfile ? (
                   <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full h-12 bg-blue-50 hover:bg-blue-100 border border-border-color text-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                   >
                     <Edit3 className="w-4 h-4 text-primary-blue" /> {isEditing ? "Cancel Edit" : "Modify Profile"}
                   </button>
                 ) : currentUser ? (
                   <button
                    onClick={() => navigate(`/chat/${id}`)}
                    className="w-full h-12 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-primary-blue/20 border border-border-color"
                   >
                     <MessageCircle className="w-4 h-4" /> Send Direct Input
                   </button>
                 ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 bg-blue-50 hover:bg-blue-100 border border-border-color text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                        <Bot className="w-4 h-4 text-primary-blue" /> Guest View Only
                    </button>
                 )}
              </div>
           </div>
           
           {/* Quick Stats Grid */}
           <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-border-color">
              {[
                { label: 'Posts', value: userStats.posts, icon: <MessageSquare className="w-4 h-4 text-primary-blue" /> },
                { label: 'Replies', value: userStats.replies, icon: <MessageCircle className="w-4 h-4 text-primary-azure" /> },
                { label: 'Reacts', value: userStats.likes, icon: <Heart className="w-4 h-4 text-rose-500" /> }
              ].map(stat => (
                <div key={stat.label} className="text-center group cursor-default">
                   <div className="text-3xl font-black text-text-primary mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                   <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      {stat.icon} {stat.label}
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-bg-card dark:bg-slate-800 rounded-[2.5rem] border border-border-color overflow-hidden shadow-xl">
               {/* Tab Headers */}
               <div className="flex p-2 bg-blue-50 border-b border-border-color">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        activeTab === tab.key
                          ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/20'
                          : 'text-slate-600 hover:text-primary-navy hover:bg-white'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] ${activeTab === tab.key ? 'bg-primary-blue/10 text-primary-blue' : 'bg-blue-200/50'}`}>{tab.count}</span>
                    </button>
                  ))}
               </div>

               {/* Tab Body */}
               <div className="p-8">
                 <AnimatePresence mode="wait">
                    {activeTab === "posts" && (
                      <motion.div 
                        key="posts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {userPosts.length > 0 ? (
                          userPosts.map((post, idx) => (
                            <div
                              key={post._id || post.id}
                              className="bg-bg-card dark:bg-slate-800 p-6 rounded-2xl hover:bg-blue-50 border border-border-color cursor-pointer transition-all group shadow-sm"
                              onClick={() => navigate(`/post/${post._id || post.id}`)}
                            >
                              <div className="flex items-center gap-2 mb-4">
                                {post.tags?.slice(0, 2).map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-primary-blue/5 text-primary-blue border border-primary-blue/10 rounded-md text-[9px] font-black uppercase tracking-widest">
                                    {tag}
                                  </span>
                                ))}
                                <span className="ml-auto text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary-blue transition-colors leading-tight">
                                {post.title}
                              </h3>
                              <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">{post.content}</p>
                              <div className="flex items-center gap-6 pt-4 border-t border-border-color text-[10px] font-black uppercase tracking-widest text-slate-600">
                                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> {post.likedBy?.length || post.likes || 0}</span>
                                <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary-blue" /> {post.comments?.length || 0}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center opacity-30">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">Stream Inactive</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "replies" && (
                      <motion.div 
                        key="replies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {userReplies.length > 0 ? (
                          userReplies.map((reply, index) => (
                            <div
                              key={index}
                              className="bg-bg-card dark:bg-slate-800 p-6 rounded-2xl hover:bg-blue-50 border border-border-color cursor-pointer transition-all shadow-sm"
                              onClick={() => navigate(`/post/${reply.postId}`)}
                            >
                              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <MessageCircle className="w-3.5 h-3.5 text-primary-blue" />
                                Synchronized to <span className="text-primary-azure">{reply.postTitle}</span>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium italic">"{reply.content}"</p>
                              <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-rose-400" /> {reply.likes || 0}</span>
                                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center opacity-30">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">No Echoes Detected</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "about" && (
                      <motion.div 
                         key="about" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                         className="space-y-10"
                      >
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="text-xs font-black text-primary-blue uppercase tracking-[0.2em] flex items-center gap-2">
                                 <Bot className="w-4 h-4" /> Core Synthesis (Bio)
                              </h3>
                              {isOwnProfile && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-slate-600 hover:text-primary-blue uppercase tracking-widest transition-colors flex items-center gap-1">
                                  <Edit3 className="w-3 h-3" /> Modify
                                </button>
                              )}
                           </div>
                           
                           {isEditing && isOwnProfile ? (
                             <div className="space-y-4">
                               <textarea
                                 value={bio}
                                 onChange={(e) => setBio(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-2xl p-5 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-medium leading-relaxed resize-none"
                                 rows={4}
                                 placeholder="Define your academic trajectory..."
                               />
                               <input
                                 value={department}
                                 onChange={(e) => setDepartment(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-5 py-3 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-bold"
                                 placeholder="Sector Allocation (Department)"
                                />
                               <div className="flex gap-4">
                                 <button onClick={handleSaveProfile} className="flex-1 py-3 bg-primary-blue hover:bg-primary-navy text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-border-color">
                                   <Save className="w-4 h-4" /> Save Sequence
                                 </button>
                                 <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-slate-600 rounded-xl font-bold transition-all border border-border-color">
                                   Discard
                                 </button>
                               </div>
                             </div>
                           ) : (
                             <div className="p-6 bg-blue-50 border border-border-color rounded-2xl shadow-sm">
                                <p className="text-slate-600 text-base leading-loose font-medium italic">
                                   {bio || "Synchronizing identity... This profile represents a node in the global AI College network."}
                                </p>
                             </div>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="p-6 bg-blue-50 border border-border-color rounded-2xl space-y-3 shadow-sm">
                              <div className="text-[10px] font-black text-primary-blue uppercase tracking-widest flex items-center gap-2">
                                 <Award className="w-4 h-4" /> Endorsement Rank
                              </div>
                              <div className="text-lg font-black text-text-primary">Elite Scholar Phase 2</div>
                              <div className="w-full bg-blue-200 rounded-full h-1 relative overflow-hidden">
                                 <div className="absolute inset-y-0 left-0 w-[85%] bg-primary-blue rounded-full"></div>
                              </div>
                           </div>
                           <div className="p-6 bg-blue-50 border border-border-color rounded-2xl space-y-3 shadow-sm">
                              <div className="text-[10px] font-black text-primary-azure uppercase tracking-widest flex items-center gap-2">
                                 <TrendingUp className="w-4 h-4" /> Network Activity
                              </div>
                              <div className="text-lg font-black text-text-primary">Top 5% Persistent</div>
                              <div className="flex gap-1 h-8 items-end">
                                 {[4, 7, 5, 8, 3, 9, 6].map((h, i) => <div key={i} className="flex-1 bg-primary-azure/20 rounded-t-sm" style={{ height: `${h * 10}%` }} />)}
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-8">
            {/* Meta Info */}
            <div className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border-color shadow-xl space-y-8">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                 <Shield className="w-4 h-4 text-primary-blue" /> Protocol Meta
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: <Shield className="w-4 h-4" />, label: 'Privilege', val: user.role || 'Student', color: 'text-primary-blue' },
                  { icon: <Mail className="w-4 h-4" />, label: 'Mail Relay', val: user.email, color: 'text-slate-600' },
                  { icon: <BookOpen className="w-4 h-4" />, label: 'Sector', val: department || 'Unallocated', color: 'text-primary-azure' },
                  { icon: <Clock className="w-4 h-4" />, label: 'Uptime', val: joinDate, color: 'text-slate-600' }
                ].map(item => (
                  <div key={item.label} className="group">
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-primary-blue transition-colors">{item.label}</div>
                    <div className={`flex items-center gap-2 font-black text-sm ${item.color} truncate`}>
                       {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Node */}
            <div className="bg-gradient-to-br from-primary-navy to-primary-blue p-8 rounded-[2.5rem] border border-border-color shadow-xl group text-white">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Reward Tier</h3>
                  <Star className="w-5 h-5 text-amber-400 animate-float" />
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-100 rounded-2xl border border-border-color">
                     <span className="text-2xl">ðŸ†</span>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest">Alpha Contributor</div>
                        <div className="text-[8px] text-white/60 font-bold uppercase tracking-widest mt-1">First 100 Scholars</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-100 rounded-2xl border border-border-color opacity-40">
                     <span className="text-2xl grayscale">ðŸ…</span>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest">Master Synchronizer</div>
                        <div className="text-[8px] text-white/60 font-bold uppercase tracking-widest mt-1">Progress: 14/100</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
