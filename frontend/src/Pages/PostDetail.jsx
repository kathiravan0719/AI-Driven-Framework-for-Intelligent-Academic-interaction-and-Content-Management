import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  ArrowLeft, 
  Clock, 
  User, 
  Sparkles,
  ChevronRight,
  Shield,
  Tag as TagIcon,
  Bot
} from "lucide-react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    getPostById,
    getUserById,
    likePost,
    addComment,
    joinPostRoom,
    leavePostRoom,
  } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = getPostById(id);

  useEffect(() => {
    if (id) {
       joinPostRoom(id);
       return () => leavePostRoom(id);
    }
  }, [id, joinPostRoom, leavePostRoom]);

  if (!post) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-border-color">
                 <Shield className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Post Synchronicity Failed</h2>
          <p className="text-slate-600 font-medium mb-12">The requested discussion stream does not exist or has been archived.</p>
          <button
            onClick={() => navigate("/feed")}
            className="px-8 py-3 bg-primary-blue hover:bg-primary-navy text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" /> Return to Feed
          </button>
        </div>
      </div>
    );
  }

  const postUser = getUserById(post.userId || post.userId?._id);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
       month: 'short', 
       day: 'numeric', 
       year: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
    });
  };

  const handleAddComment = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(post._id || post.id, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-slate-900 text-text-primary selection:bg-primary-blue/20 overflow-x-hidden">
      <Header />

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] bg-primary-blue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-primary-azure/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/feed")}
          className="mb-12 group flex items-center gap-2 text-slate-600 hover:text-primary-blue transition-all font-bold uppercase tracking-widest text-[10px]"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border-color group-hover:bg-primary-blue group-hover:border-primary-blue group-hover:text-white transition-all shadow-sm">
             <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Knowledge Stream
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color shadow-xl relative overflow-hidden"
            >
              {/* Highlight Aura */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-10">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary-blue rounded-2xl blur-md opacity-20"></div>
                    <button 
                      onClick={() => navigate(`/profile/${postUser?._id || postUser?.id}`)}
                      className="relative w-14 h-14 bg-gradient-to-br from-primary-navy to-primary-blue border border-border-color rounded-2xl flex items-center justify-center text-white font-black text-xl hover:scale-110 transition-transform active:scale-95 overflow-hidden shadow-lg"
                    >
                      {postUser?.avatar || (postUser?.name || "U").charAt(0).toUpperCase()}
                    </button>
                 </div>
                 <div>
                    <button
                      onClick={() => navigate(`/profile/${postUser?._id || postUser?.id}`)}
                      className="font-black text-text-primary text-lg hover:text-primary-blue transition-colors tracking-tight"
                    >
                      {postUser?.name || "Unknown Scholar"}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                      <Clock className="w-3 h-3 text-primary-azure" />
                      {formatTimestamp(post.timestamp || post.createdAt)}
                      <span className="mx-2 opacity-20">â€¢</span>
                      <span className="text-primary-blue/60 uppercase">{post.category || "General"}</span>
                    </div>
                 </div>
                 <div className="ml-auto hidden sm:block">
                     <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-border-color rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest shadow-sm">
                        <Shield className="w-3 h-3 text-primary-blue" /> Integrity Verified
                     </div>
                 </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-6 leading-tight tracking-tight">
                {post.title}
              </h1>

              <div className="prose prose-slate max-w-none mb-12">
                 <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap italic opacity-90 border-l-4 border-primary-blue/30 pl-6 py-2">
                    {post.content}
                 </p>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-border-color">
                <button
                  onClick={() => likePost(post._id || post.id)}
                  className="group flex items-center gap-2.5 text-sm font-black uppercase tracking-widest transition-colors"
                >
                  <div className={`p-2.5 rounded-xl transition-all ${post.likedBy?.includes(currentUser?.id) ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-blue-50 text-slate-600 border border-border-color group-hover:bg-rose-500/10 group-hover:text-rose-500"}`}>
                    <Heart className={`w-5 h-5 ${post.likedBy?.includes(currentUser?.id) ? "fill-current" : ""}`} />
                  </div>
                  <span className={post.likedBy?.includes(currentUser?.id) ? "text-rose-500" : "text-slate-600"}>{post.likes || 0}</span>
                </button>
                
                <div className="flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-slate-600">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-slate-600 border border-border-color">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span>{post.comments?.length || 0}</span>
                </div>

                <button className="ml-auto p-2.5 rounded-xl bg-blue-50 text-slate-600 border border-border-color hover:text-primary-blue hover:bg-primary-blue/10 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Comments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h2 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-3">
                   Knowledge Exchange
                   <div className="px-2 py-0.5 bg-primary-blue/10 rounded-md text-[10px] text-primary-blue border border-primary-blue/20">{post.comments?.length || 0}</div>
                 </h2>
              </div>

              {currentUser ? (
                <div className="bg-bg-card dark:bg-slate-800 p-6 rounded-[2rem] border border-primary-blue/20 bg-gradient-to-br from-primary-blue/5 to-transparent relative overflow-hidden group shadow-xl">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-blue rounded-2xl flex items-center justify-center text-lg shrink-0 overflow-hidden font-black text-white shadow-lg border border-border-color">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Contribute to the synthesis..."
                        className="w-full bg-transparent border-none p-0 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-0 resize-none font-medium leading-relaxed min-h-[100px]"
                      />
                      <div className="flex justify-between items-center pt-2">
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary-azure" /> AI Enhancement Active
                         </div>
                         <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isSubmitting}
                          className="px-8 py-2.5 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary-blue/20 disabled:opacity-30 flex items-center gap-2 border border-border-color"
                        >
                          {isSubmitting ? <Sparkles className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Inject Insight
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2rem] text-center border border-border-color shadow-xl">
                  <p className="text-slate-600 font-bold text-sm mb-4">
                    Neural authentication required for high-level interaction.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2.5 bg-primary-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                  >
                    Authenticate Now
                  </button>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <AnimatePresence>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment, idx) => {
                      const commentUser = getUserById(comment.userId || comment.userId?._id);
                      return (
                        <motion.div
                          key={comment._id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-bg-card dark:bg-slate-800 p-6 rounded-[2rem] border border-border-color flex gap-5 hover:border-primary-blue/20 hover:bg-blue-50 transition-all group shadow-sm"
                        >
                          <div
                            className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-base shrink-0 font-black border border-border-color cursor-pointer hover:bg-primary-blue/20 hover:text-primary-blue transition-all"
                            onClick={() => navigate(`/profile/${commentUser?._id || commentUser?.id}`)}
                          >
                            {commentUser?.avatar || (commentUser?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <button
                                onClick={() => navigate(`/profile/${commentUser?._id || commentUser?.id}`)}
                                className="font-bold text-text-primary text-sm hover:text-primary-blue transition-colors"
                              >
                                {commentUser?.name || "Unknown Scholar"}
                              </button>
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                {formatTimestamp(comment.timestamp || comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-6">
                              <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-rose-500 transition-colors">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{comment.likes || 0}</span>
                              </button>
                              <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-blue transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center opacity-30">
                       <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                       <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-600">Void Detected</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border-color shadow-xl sticky top-24">
              <div className="mb-10 text-center">
                 <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary-blue blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary-navy to-primary-blue rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border border-border-color text-white font-black">
                       {postUser?.avatar || (postUser?.name || "U").charAt(0).toUpperCase()}
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-text-primary tracking-tight mb-1">{postUser?.name}</h3>
                 <p className="text-[10px] font-black text-primary-blue uppercase tracking-[0.2em] mb-4">Academic Operator</p>
                 <button 
                  onClick={() => navigate(`/profile/${postUser?._id || postUser?.id}`)}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-border-color text-slate-600"
                 >
                    View Network Profile
                 </button>
              </div>

              <div className="space-y-8 border-t border-border-color pt-8">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <TagIcon className="w-3 h-3 text-primary-blue" /> Genetic Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags && post.tags.length > 0 ? (
                        post.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-primary-blue/5 text-primary-blue border border-primary-blue/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-primary-blue hover:text-white cursor-default">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-black text-slate-500 uppercase italic px-1">Unclassified</span>
                      )}
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-primary-blue/5 border border-primary-blue/10">
                    <div className="flex items-center gap-3 text-primary-blue font-bold text-xs mb-3">
                       <Bot className="w-4 h-4" /> AI Classification
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium leading-relaxed">
                       This post has been indexed in the <span className="text-primary-blue font-black">{post.category}</span> node. Quality score: <span className="text-text-primary font-black">94%</span>
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

export default PostDetail;
