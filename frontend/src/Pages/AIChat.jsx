import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { 
  Bot, Send, Sparkles, BookOpen, 
  MessageSquare, Plus, AlignLeft,
  Copy, CheckCheck, RefreshCcw, FileText, Trash2,
  Calendar, Zap, ArrowLeft, ArrowRight, User
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AIChat() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const contextDocId = location.state?.documentId || null;
  const contextDocTitle = location.state?.contextTitle || null;
  
  // States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  const SUGGESTIONS = [
    { label: 'How do I create a post?', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Summarize my uploaded notes', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Upcoming campus events?', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Library opening hours', icon: <Bot className="w-4 h-4" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingHistory(true);
      const res = await api.get('/ai/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadConversation = async (id) => {
    if (activeChatId === id) return;
    try {
      setIsTyping(true);
      const res = await api.get(`/ai/conversation/${id}`);
      setActiveChatId(id);
      
      const formattedMessages = res.data.messages.map(m => ({
        type: m.role === 'user' ? 'user' : 'ai',
        id: m._id,
        content: m.content,
        sources: m.sources,
        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setMessages(formattedMessages);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/ai/conversation/${id}`);
      if (activeChatId === id) {
        handleNewChat();
      }
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSubmit = input) => {
    if (!textToSubmit.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { type: 'user', id: Date.now().toString(), content: textToSubmit.trim(), timestamp };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { 
        message: userMessage.content,
        conversationId: activeChatId,
        documentId: contextDocId
      });

      const aiMsg = { 
        type: 'ai', 
        id: res.data.messageId, 
        content: res.data.content,
        sources: res.data.sources || [],
        timestamp: new Date(res.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (!activeChatId) {
        setActiveChatId(res.data.conversationId);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        id: (Date.now() + 1).toString(), 
        content: "Oops! I encountered an error connecting to my neural network. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.type === 'user');
    if (lastUserMsg && !isTyping) {
      handleSend(lastUserMsg.content);
    }
  };

  const MarkdownComponents = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="rounded-2xl overflow-hidden my-6 border border-slate-200 shadow-xl">
          <div className="bg-slate-900 text-slate-400 text-[10px] px-5 py-2 flex justify-between items-center border-b border-white/5 font-black uppercase tracking-widest">
            <span>{match[1]}</span>
            <button onClick={() => handleCopy(String(children), 'code')} className="hover:text-white transition-colors">Copy Source</button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, border: 'none', borderRadius: 0, padding: '24px', background: '#0f172a' }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-primary-blue/10 text-primary-blue px-2 py-0.5 rounded-md text-sm font-mono border border-primary-blue/10" {...props}>
          {children}
        </code>
      );
    },
    h3: ({node, ...props}) => <h3 className="text-xl font-black text-slate-900 mb-4 mt-8 flex items-center gap-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-5 leading-relaxed text-slate-600 font-medium" {...props} />,
    a: ({node, ...props}) => <a className="text-primary-blue hover:text-primary-navy underline font-bold" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3 text-slate-600 font-medium" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-slate-600 font-medium" {...props} />,
    li: ({node, ...props}) => <li className="pl-2" {...props} />,
    strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-blue/50 bg-primary-blue/5 px-6 py-4 rounded-r-2xl italic text-slate-500 my-6" {...props} />,
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-slate-700 selection:bg-primary-blue/20 overflow-hidden">
      <Header />
      
      {/* Background Aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary-blue/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-primary-navy/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10 h-full">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-md" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-8">
            <button 
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-primary-blue hover:bg-primary-navy text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-blue/20 active:scale-95 flex items-center gap-2 group"
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Initialize Session
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
            <div className="text-[10px] font-black text-slate-400 mb-6 px-4 uppercase tracking-[0.2em] flex items-center justify-between">
               Neural Streams
               <Zap className="w-3 h-3 text-primary-azure" />
            </div>
            {isLoadingHistory ? (
              <div className="space-y-4 px-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-white/5 rounded-xl shimmer" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                   <button 
                    key={item._id}
                    onClick={() => loadConversation(item._id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all text-sm flex items-center justify-between group border ${
                      activeChatId === item._id 
                        ? 'bg-primary-blue/5 border-primary-blue/20 text-primary-blue font-bold' 
                        : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-primary-navy'
                    }`}
                  >
                    <span className="truncate pr-2 flex items-center gap-3">
                      <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${activeChatId === item._id ? 'text-primary-blue' : 'text-slate-300'}`} />
                      {item.title}
                    </span>
                    <span 
                      onClick={(e) => deleteConversation(e, item._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 
                    </span>
                  </button>
                ))}

                {history.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                       <Bot className="w-6 h-6 text-slate-700" />
                    </div>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Archive Empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-8 border-t border-slate-100">
            <div className="bg-primary-blue/5 rounded-2xl p-5 border border-primary-blue/10">
              <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-primary-blue">
                 Efficiency Level
                 <span>75%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '75%' }}
                   className="bg-primary-blue h-1.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Neural Synchronization Active</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
          
          {/* Header (Context or Branding) */}
          <div className="bg-white/80 border-b border-slate-200 px-8 h-20 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
               <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-100 text-slate-500 hover:text-primary-blue rounded-xl transition">
                 <AlignLeft className="w-5 h-5" />
               </button>
                {contextDocId ? (
                  <div className="flex items-center gap-4 animate-fadeIn">
                     <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center border border-primary-blue/20 relative">
                        <Sparkles className="w-5 h-5 text-primary-blue" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-azure rounded-full border-2 border-white animate-pulse"></div>
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <div className="text-xs font-black text-primary-blue uppercase tracking-widest mb-0.5">Active Subject Context</div>
                           <span className="bg-primary-blue/10 text-primary-blue text-[8px] font-black px-2 py-0.5 rounded-full border border-primary-blue/20 uppercase tracking-widest">Context Locked</span>
                        </div>
                        <div className="text-[15px] font-black text-slate-900">{contextDocTitle}</div>
                     </div>
                  </div>
                ) : (
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center shadow-lg shadow-primary-blue/20">
                       <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Neural Assistant</div>
                       <div className="text-[15px] font-black text-slate-900 tracking-tight">AI College CMS <span className="text-primary-blue">PRO</span></div>
                    </div>
                 </div>
               )}
            </div>
            <div className="hidden md:flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Synchronized</span>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto pt-10 pb-44 px-4 md:px-12 scroll-smooth no-scrollbar">
            <div className="max-w-4xl mx-auto flex flex-col space-y-12">
              
              {/* Empty state suggestions */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 bg-primary-blue/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-12 border border-primary-blue/20 relative"
                  >
                    <div className="absolute inset-0 bg-primary-blue rounded-[2.5rem] blur-2xl opacity-10 animate-pulse"></div>
                    <Sparkles className="w-14 h-14 text-primary-blue relative z-10" />
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Infinite <span className="gradient-text">Intelligence.</span>
                  </h2>
                  <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto mb-16 leading-relaxed">
                    Access real-time synthesis of academic logs, campus events, and department archives.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                    {SUGGESTIONS.map((s, idx) => (
                      <motion.button 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSend(s.label)}
                        className="p-6 bg-white border border-slate-200 rounded-3xl text-left hover:bg-slate-50 transition-all group flex items-start gap-5 hover:-translate-y-1 relative shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary-blue/10 group-hover:border-primary-blue/20 transition-all">
                          <span className="text-primary-blue group-hover:scale-110 transition-all">{s.icon}</span>
                        </div>
                        <span className="text-[15px] font-black text-slate-700 group-hover:text-primary-navy mt-3 leading-snug">{s.label}</span>
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-5 h-5 text-primary-blue" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isLastAi = msg.type === 'ai' && index === messages.length - 1;
                  
                  return (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-6 max-w-[90%] md:max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* Avatar */}
                        <div className={`shrink-0 pt-2 ${msg.type === 'user' ? 'hidden sm:block' : ''}`}>
                           {msg.type === 'ai' ? (
                             <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center border border-primary-blue/20 shadow-xl shadow-primary-blue/5">
                                <Bot className="w-7 h-7 text-primary-blue" />
                             </div>
                           ) : (
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 group shadow-xl">
                                <User className="w-7 h-7 text-slate-400 group-hover:text-primary-blue transition-colors" />
                             </div>
                           )}
                        </div>

                        {/* Content */}
                        <div className={`space-y-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                           <div className={`inline-block text-left px-8 py-6 rounded-[2rem] shadow-xl relative ${
                             msg.type === 'user' 
                               ? 'bg-primary-blue text-white rounded-tr-none border border-primary-navy shadow-primary-blue/20' 
                               : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                           }`}>
                             {msg.type === 'user' ? (
                               <p className="m-0 whitespace-pre-wrap leading-relaxed text-[16px] font-bold">{msg.content}</p>
                             ) : (
                               <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
                                 <ReactMarkdown components={MarkdownComponents}>
                                   {msg.content}
                                 </ReactMarkdown>
                               </div>
                             )}
                           </div>

                           {/* Citations Area */}
                           {msg.type === 'ai' && msg.sources && msg.sources.length > 0 && (
                             <div className="flex flex-wrap gap-2 pt-2">
                               {msg.sources.map((src, idx) => (
                                 <button key={idx} className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-primary-blue/5 border border-slate-200 hover:border-primary-blue/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-blue transition-all active:scale-95 group/source shadow-sm">
                                     <div className="w-5 h-5 rounded-lg bg-slate-50 flex items-center justify-center group-hover/source:bg-primary-blue/10 transition-colors">
                                        <FileText className="w-3 h-3 text-primary-blue" />
                                     </div>
                                     {src.title}
                                 </button>
                               ))}
                             </div>
                           )}

                           {/* Message Footer */}
                           <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 justify-between">
                              <div className="flex items-center gap-4">
                                 {msg.timestamp}
                                 {msg.type === 'ai' && (
                                   <div className="flex items-center gap-3">
                                      <button onClick={() => handleCopy(msg.content, msg.id)} className="hover:text-primary-blue"><Copy className="w-3 h-3" /></button>
                                      {isLastAi && <button onClick={handleRegenerate} className="hover:text-primary-blue"><RefreshCcw className="w-3 h-3" /></button>}
                                   </div>
                                 )}
                              </div>
                              {msg.type === 'ai' && <div className="text-primary-blue/40">Verified Source Protocol</div>}
                           </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing State */}
              {isTyping && (
                <div className="flex w-full justify-start animate-fadeIn">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center border border-primary-blue/20">
                      <Bot className="w-7 h-7 text-primary-blue animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-full border border-slate-200 shadow-sm">
                       <span className="text-xs font-black uppercase tracking-widest text-primary-blue animate-pulse">
                         {messages.length % 3 === 0 ? "Analyzing Campus Records..." : 
                          messages.length % 3 === 1 ? "Retrieving Neural Context..." : 
                          "Synthesizing Response..."}
                       </span>
                       <div className="flex gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '200ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '400ms' }} />
                       </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-10" />
            </div>
          </div>

          {/* Floating Input Dock */}
          <div className="absolute bottom-10 left-0 right-0 px-6 md:px-12 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-3 relative group">
                <div className="flex items-end gap-3 pr-2">
                   <div className="flex-1 relative">
                      <textarea
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = '64px';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                            e.target.style.height = '64px';
                          }
                        }}
                        placeholder="Define your query..."
                        className="w-full bg-transparent border-none py-5 px-6 pt-6 text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none no-scrollbar font-bold text-lg min-h-[64px]"
                        rows={1}
                        style={{ height: '64px' }}
                      />
                   </div>
                   <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="w-14 h-14 rounded-3xl bg-primary-blue hover:bg-primary-navy text-white flex items-center justify-center transition-all duration-500 shadow-xl disabled:bg-slate-100 disabled:text-slate-300 active:scale-90 shrink-0 mb-1"
                   >
                    <Send className="w-6 h-6" />
                   </button>
                </div>
                
                {/* Visual Accent */}
                <div className="absolute -bottom-1 -left-1 -right-1 h-1.5 bg-primary-blue/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                 <div className="h-px bg-slate-200 w-12" />
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">AI College Advanced Synergy</div>
                 <div className="h-px bg-slate-200 w-12" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
