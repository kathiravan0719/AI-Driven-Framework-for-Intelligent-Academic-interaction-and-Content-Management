import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, MessageSquare, FolderOpen, 
  MessageCircle, Sparkles, User, Settings, Shield,
  BookOpen, Calendar, Info, BarChart3, ChevronRight 
} from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const actions = [
    { id: 'feed', label: 'Go to Feed', icon: <MessageSquare className="w-4 h-4" />, path: '/feed' },
    { id: 'content', label: 'Browse Content', icon: <FolderOpen className="w-4 h-4" />, path: '/content' },
    { id: 'chat', label: 'Open Messages', icon: <MessageCircle className="w-4 h-4" />, path: '/chat' },
    { id: 'ai', label: 'Talk to AI Assistant', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, path: '/ai-chat' },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" />, path: '/profile/me' },
    { id: 'topics', label: 'Browse Topics', icon: <BookOpen className="w-4 h-4" />, path: '/topics' },
    { id: 'events', label: 'View Events', icon: <Calendar className="w-4 h-4" />, path: '/events' },
    { id: 'analytics', label: 'View Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/analytics' },
    { id: 'about', label: 'About Platform', icon: <Info className="w-4 h-4" />, path: '/about' },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          navigate(filteredActions[selectedIndex].path);
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
  }, [isOpen, filteredActions, selectedIndex, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-blue-950/40 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-blue-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-blue-100">
              <Search className="w-6 h-6 text-slate-600" />
              <input
                autoFocus
                type="text"
                placeholder="Search for pages or actions... (Esc to close)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none text-xl outline-none text-slate-900 placeholder-blue-400 font-bold tracking-tight"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">
                 <Command className="w-3.5 h-3.5 text-slate-500" />
                 <span className="text-xs font-bold text-slate-500">K</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-3 px-2 custom-scrollbar">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                        index === selectedIndex 
                        ? 'bg-primary-blue shadow-lg shadow-primary-blue/20 translate-x-1' 
                        : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className={`flex items-center gap-4 ${index === selectedIndex ? 'text-white' : 'text-slate-700'}`}>
                        <div className={`p-2 rounded-xl ${index === selectedIndex ? 'bg-white/20' : 'bg-blue-100 text-slate-500'}`}>
                          {action.icon}
                        </div>
                        <span className="font-bold tracking-tight">{action.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {index === selectedIndex && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                          >
                            Jump to
                            <ChevronRight className="w-3 h-3" />
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                    <Search className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-bold tracking-tight">No actions found for "{search}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-white rounded text-[10px] font-black text-slate-500 border border-blue-200 shadow-sm">⏎</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black">to select</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-5 bg-white rounded text-[10px] font-black text-slate-500 border border-blue-200 shadow-sm">↑↓</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black">to navigate</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-5 bg-white rounded text-[10px] font-black text-slate-500 border border-blue-200 shadow-sm">ESC</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black">to close</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
