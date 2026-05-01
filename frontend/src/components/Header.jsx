import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  LogOut, 
  User, 
  ChevronDown, 
  MessageSquare, 
  FolderOpen, 
  MessageCircle, 
  Shield, 
  Sparkles,
  BarChart3,
  BookOpen,
  Calendar,
  Info,
  GraduationCap,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';

const Header = () => {
  const { currentUser, logout, unreadChatCount, socket } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);
  const moreRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const primaryLinks = [
    { to: '/feed', label: 'Feed', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/content', label: 'Content', icon: <FolderOpen className="w-4 h-4" /> },
    { to: '/chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    ...(currentUser?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Dashboard', icon: <Shield className="w-4 h-4" /> }] : []),
  ];

  const aiLink = { to: '/ai-chat', label: 'AI Assistant', icon: <Sparkles className="w-4 h-4" /> };

  const secondaryLinks = [
    { to: '/topics', label: 'Topics', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/content?tab=events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { to: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const allNavLinks = [...primaryLinks, aiLink, ...secondaryLinks];
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser) {
      api.get('/notifications').then(res => setNotifications(res.data)).catch(err => console.error(err));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClick = (e) => { 
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); 
    };
    document.addEventListener('mousedown', handleClick);
    if (socket) {
      socket.on('new-notification', (notif) => setNotifications(prev => [notif, ...prev]));
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      if (socket) socket.off('new-notification');
    };
  }, [socket]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path) => {
    if (path === '/content?tab=events') {
      return location.pathname === '/content' && location.search.includes('tab=events');
    }
    if (path === '/content') {
      return location.pathname === '/content' && !location.search.includes('tab=events');
    }
    return location.pathname === path || (path === '/chat' && location.pathname.startsWith('/chat')) || (path === '/ai-chat' && location.pathname.startsWith('/ai-chat'));
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-bg-primary border-b border-border-color backdrop-blur-xl shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3 font-bold relative shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11">
            <div className="absolute inset-0 bg-primary-blue rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-11 h-11 glass-indigo rounded-xl flex items-center justify-center border border-primary-blue/10 shadow-xl group-hover:scale-110 transition-all duration-500">
               <GraduationCap className="w-6 h-6 text-primary-blue group-hover:text-primary-navy transition-colors" />
               <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary-azure animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col -gap-0.5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-navy to-primary-blue font-extrabold tracking-tight text-xl">
              AI College CMS
            </span>
            <span className="text-[10px] text-primary-blue uppercase tracking-[0.2em] font-bold opacity-80">Intelligent Learning Hub</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-blue-100 p-1 rounded-2xl border border-blue-200 backdrop-blur-md">
          {primaryLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group ${isActive(to)
                ? 'text-primary-blue'
                : 'text-slate-600 hover:text-primary-navy'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className={`transition-colors duration-300 ${isActive(to) ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-500'}`}>{icon}</span>
                {label}
              </span>
              {isActive(to) && (
                <>
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white border border-blue-200 rounded-xl shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-primary-blue to-primary-azure rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
              {to === '/chat' && unreadChatCount > 0 && (
                <span className="relative z-20 ml-1.5 w-5 h-5 bg-primary-blue text-white rounded-full text-[10px] flex items-center justify-center font-black border-2 border-white shadow-lg animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </Link>
          ))}

          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* AI Premium Highlight */}
          <Link
            to={aiLink.to}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black active:scale-95 transition-all duration-500 group overflow-hidden ${isActive(aiLink.to)
              ? 'bg-gradient-to-r from-primary-navy via-primary-blue to-primary-azure text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)]'
              : 'bg-white border border-blue-200 text-primary-blue hover:text-primary-navy'
            }`}
          >
             {!isActive(aiLink.to) && (
                 <div className="absolute inset-0 bg-gradient-to-r from-primary-navy/10 to-primary-blue/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             )}
             <span className="relative z-10 flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isActive(aiLink.to) ? 'text-white' : 'text-primary-blue animate-pulse'}`} />
                {aiLink.label}
             </span>
             <span className={`relative z-10 ml-1 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-black border ${isActive(aiLink.to) ? 'bg-white/20 border-white/20' : 'bg-primary-blue/10 border-primary-blue/20'}`}>
                PRO
             </span>
          </Link>
        </nav>

        {/* Action Center */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-xl border transition-all duration-300 text-slate-600 dark:text-slate-300 border-transparent hover:border-border-color hover:bg-bg-secondary"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className={`relative p-2.5 rounded-xl transition-all border border-transparent ${showNotif ? 'bg-blue-100 text-primary-blue border-blue-200' : 'text-slate-600 hover:text-primary-blue hover:bg-blue-50'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-primary-azure rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-[450px] bg-white border border-blue-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[150] overflow-hidden"
                  >
                    <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-blue/5 rounded-xl text-primary-blue border border-primary-blue/10">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                           <span className="font-black text-sm uppercase tracking-widest text-slate-900">Neural Alert Terminal</span>
                           <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Real-time Knowledge Sync</div>
                        </div>
                      </div>
                      <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-[0.22em] text-primary-blue hover:text-primary-navy px-3 py-1.5 rounded-lg hover:bg-white transition-all">
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center opacity-40">
                           <div className="relative mb-6">
                              <Bell className="w-12 h-12 text-slate-600" />
                              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">No signals detected in the network.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.03]">
                          {notifications.map(n => (
                            <Link 
                              key={n._id} to={n.link} onClick={() => setShowNotif(false)} 
                              className={`block px-8 py-6 hover:bg-blue-50 transition-all relative group ${!n.isRead ? 'bg-primary-blue/[0.03]' : ''}`}
                            >
                              {!n.isRead && (
                                 <motion.div layoutId={`dot-${n._id}`} className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-blue shadow-[0_0_15px_rgba(37,99,235,0.5)]"></motion.div>
                              )}
                              <div className="flex items-start gap-5">
                                <div className={`p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110 ${
                                   n.type === 'event' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                                   n.type === 'academic_update' ? 'bg-primary-azure/10 text-primary-azure border-primary-azure/20' :
                                   'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                                }`}>
                                   {n.type === 'event' ? <Calendar className="w-5 h-5" /> : 
                                    n.type === 'academic_update' ? <GraduationCap className="w-5 h-5" /> : 
                                    <Sparkles className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                     <div className={`text-[11px] font-black uppercase tracking-widest ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</div>
                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className={`text-xs leading-relaxed font-medium ${!n.isRead ? 'text-slate-600' : 'text-slate-600 opacity-60'} line-clamp-2`}>{n.message}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1.5 bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded-2xl transition-all group"
              >
                <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary-blue/50 transition-all flex items-center justify-center bg-gradient-to-br from-primary-navy to-primary-blue font-bold text-white shadow-lg">
                    {currentUser.name?.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${menuOpen ? 'rotate-180 text-primary-blue' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 bg-white border border-blue-200 rounded-3xl shadow-xl p-2 z-[200]"
                  >
                    <div className="px-5 py-4 mb-2 border-b border-blue-100">
                       <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                       <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{currentUser.role}</div>
                    </div>
                    
                    <Link to={`/profile/${currentUser.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-primary-blue transition-all group">
                      <div className="p-2 bg-blue-100 rounded-lg text-slate-600 group-hover:text-primary-blue transition-colors"><User className="w-4 h-4" /></div>
                      My Profile
                    </Link>
                    
                    <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-primary-blue transition-all group">
                      <div className="p-2 bg-blue-100 rounded-lg text-slate-600 group-hover:text-primary-blue transition-colors"><MessageCircle className="w-4 h-4" /></div>
                      Messages
                      {unreadChatCount > 0 && <span className="ml-auto px-2 py-0.5 bg-primary-blue rounded-full text-[10px] font-bold text-white">{unreadChatCount}</span>}
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-blue-50 hover:text-primary-blue transition-all group">
                        <div className="p-2 bg-blue-100 rounded-lg text-slate-600 group-hover:text-primary-blue transition-colors"><Shield className="w-4 h-4" /></div>
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="h-px bg-blue-100 my-2 mx-2"></div>
                    
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group">
                      <div className="p-2 bg-rose-500/5 rounded-lg text-rose-500/50 group-hover:text-rose-400 transition-colors"><LogOut className="w-4 h-4" /></div>
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-primary-blue transition-all">Login</Link>
              <Link to="/signup" className="px-6 py-2.5 text-sm font-extrabold bg-primary-blue hover:bg-primary-navy text-white rounded-2xl transition-all shadow-xl shadow-primary-blue/20 active:scale-95">Join Now</Link>
            </div>
          )}

          <button className="lg:hidden p-2.5 bg-bg-secondary dark:bg-slate-800 border border-border-color rounded-2xl text-slate-600 dark:text-slate-300 hover:text-primary-blue active:scale-95 transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[9999] bg-bg-primary dark:bg-slate-900 flex flex-col pt-24 transition-colors"
          >
            {/* Background Aura (Very faint) */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
               <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-primary-blue/20 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-primary-azure/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-12 no-scrollbar flex flex-col items-center">
              <div className="w-full max-w-sm flex flex-col gap-3.5">
                {allNavLinks.map((link, i) => (
                  <motion.div 
                    key={link.to} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link 
                      to={link.to} 
                      onClick={() => setMobileOpen(false)} 
                      className={`flex items-center gap-5 px-7 py-5 rounded-[2rem] text-lg font-black tracking-tight transition-all active:scale-95 border ${
                        isActive(link.to) 
                          ? 'bg-primary-blue text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] border-white/20' 
                          : 'text-slate-900 bg-blue-50 border-blue-100 hover:bg-blue-100'
                      }`}
                    >
                      <div className={`p-2.5 rounded-2xl ${isActive(link.to) ? 'bg-white/20 text-white' : 'bg-primary-blue/10 text-primary-blue'}`}>
                         {link.icon}
                      </div>
                      <span className="flex-1">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                <div className="h-px bg-white/10 my-6 mx-8 opacity-30"></div>
                
                <motion.button 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: allNavLinks.length * 0.03 }}
                  onClick={() => { setMobileOpen(false); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })); }} 
                  className="flex items-center gap-5 px-7 py-5 rounded-[2rem] text-lg font-black tracking-tight text-slate-500 bg-white/[0.05] border border-white/5 active:scale-95 transition-all shadow-lg"
                >
                   <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400"><Search className="w-5 h-5" /></div>
                   <span className="flex-1 text-left">Quick Search</span>
                   <span className="text-[10px] bg-white/10 px-2 py-1 rounded-lg opacity-40">CTRL + K</span>
                </motion.button>

                {currentUser ? (
                   <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (allNavLinks.length + 1) * 0.03 }}
                    onClick={handleLogout}
                    className="flex items-center gap-5 px-7 py-5 rounded-[2rem] text-lg font-black tracking-tight text-rose-400 bg-rose-500/5 border border-rose-500/10 active:scale-95 transition-all shadow-lg mt-4"
                  >
                   <div className="p-2.5 rounded-2xl bg-rose-500/10"><LogOut className="w-5 h-5" /></div>
                   <span className="flex-1 text-left">Secure Logout</span>
                </motion.button>
                ) : (
                   <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (allNavLinks.length + 1) * 0.03 }}
                    className="grid grid-cols-2 gap-4 mt-6"
                  >
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center p-5 rounded-[2rem] bg-white/5 border border-white/10 text-slate-500 font-black">Login</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center p-5 rounded-[2rem] bg-indigo-600 text-white font-black shadow-lg">Sign Up</Link>
                  </motion.div>
                )}
              </div>
            </div>
            
                <button 
                  className="absolute top-8 right-8 p-4 bg-bg-secondary dark:bg-slate-800 border border-border-color rounded-2xl text-slate-900 dark:text-white shadow-xl hover:scale-110 active:scale-90 transition-all z-[100]" 
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-7 h-7" />
                </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
