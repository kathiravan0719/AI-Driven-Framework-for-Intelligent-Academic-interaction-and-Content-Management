import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Edit3, Megaphone, FolderOpen, ClipboardList,
  Upload, Download, Trash2, Search, Calendar, HardDrive,
  DownloadCloud, CheckCircle, AlertTriangle, X, Plus,
  MapPin, Clock, Users, Tag, BookOpen, Zap, Star,
  ChevronRight, Filter, Globe, GraduationCap, Wrench,
  Archive, Library, Sparkles, Bot, List, LayoutGrid, UploadCloud, Database, User
} from 'lucide-react';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CONTENT_TYPES = ['Notes', 'Assignment', 'Circular', 'Resource', 'Syllabus'];
const CONTENT_CATEGORIES = ['General', 'Academic', 'Technical', 'Administrative', 'Library'];
const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry', 'Electronics', 'Other'];
const EVENT_CATEGORIES = ['General', 'Academic', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Placement'];

const EVENT_EMOJIS = ['ðŸŽ¯', 'ðŸ’¼', 'ðŸŽ­', 'ðŸ¤–', 'âš½', 'ðŸš€', 'ðŸŽ“', 'ðŸŽŠ', 'ðŸ”¬', 'ðŸ†', 'ðŸŽ¨', 'ðŸŒŸ'];

const CATEGORY_ICONS = {
  General: <Globe className="w-3.5 h-3.5" />,
  Academic: <GraduationCap className="w-3.5 h-3.5" />,
  Technical: <Wrench className="w-3.5 h-3.5" />,
  Administrative: <Archive className="w-3.5 h-3.5" />,
  Library: <Library className="w-3.5 h-3.5" />
};

const CATEGORY_STYLES = {
  General:        'bg-blue-500/10 text-slate-600 border-blue-500/20',
  Academic:       'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
  Technical:      'bg-primary-azure/10 text-primary-azure border-primary-azure/20',
  Administrative: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Library:        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const EVENT_CAT_STYLES = {
  General:     { bg: 'from-blue-600 to-blue-800',   badge: 'bg-blue-500/10 text-slate-600 border-blue-500/20' },
  Academic:    { bg: 'from-primary-navy to-primary-blue',    badge: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'  },
  Cultural:    { bg: 'from-pink-600 to-rose-700',      badge: 'bg-pink-500/10 text-pink-600 border-pink-500/20'  },
  Technical:   { bg: 'from-primary-azure to-blue-400',  badge: 'bg-primary-azure/10 text-primary-azure border-primary-azure/20' },
  Sports:      { bg: 'from-emerald-600 to-teal-700',  badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  Workshop:    { bg: 'from-orange-600 to-amber-700',   badge: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  Placement:   { bg: 'from-cyan-600 to-teal-700',     badge: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'  },
};

const TYPE_ICONS = {
  Notes:      <FileText className="w-5 h-5" />,
  Assignment: <Edit3 className="w-5 h-5" />,
  Circular:   <Megaphone className="w-5 h-5" />,
  Resource:   <FolderOpen className="w-5 h-5" />,
  Syllabus:   <ClipboardList className="w-5 h-5" />,
};

const TYPE_ICON_STYLES = {
  Notes:      'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
  Assignment: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Circular:   'bg-rose-500/10 text-rose-600 border-rose-500/20',
  Resource:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Syllabus:   'bg-primary-navy/10 text-primary-navy border-primary-navy/20',
};

function formatBytes(bytes) {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// â”€â”€â”€ Toast Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={`fixed top-24 right-6 z-[110] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 backdrop-blur-xl border ${toast.ok ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
    >
      <div className={`p-1.5 rounded-lg bg-white/20`}>
        {toast.ok ? <CheckCircle className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white" />}
      </div>
      {toast.msg}
    </motion.div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ContentManagement() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'events' ? 'events' : 'materials');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'events' ? 'events' : 'materials');
  }, [searchParams]);

  // Materials state
  const [contents, setContents] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [searchContent, setSearchContent] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Notes');
  const [category, setCategory] = useState('Academic');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [filterEventCat, setFilterEventCat] = useState('All');
  const [filterEventStatus, setFilterEventStatus] = useState('upcoming');
  const [searchEvent, setSearchEvent] = useState('');
  const [registering, setRegistering] = useState(null);

  // Event form fields
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evCat, setEvCat] = useState('General');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('10:00');
  const [evLocation, setEvLocation] = useState('');
  const [evMax, setEvMax] = useState(100);
  const [evEmoji, setEvEmoji] = useState('ðŸŽ¯');

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContent = async () => {
    try {
      setLoadingContent(true);
      const params = {};
      if (filterType !== 'All') params.type = filterType;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterSubject !== 'All') params.subject = filterSubject;
      if (searchContent) params.search = searchContent;
      const res = await api.get('/content', { params });
      setContents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch materials failed:', err);
      showToast('Failed to load materials', false);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const params = {};
      if (filterEventCat !== 'All') params.category = filterEventCat;
      if (filterEventStatus !== 'All') params.status = filterEventStatus;
      if (searchEvent) params.search = searchEvent;
      const res = await api.get('/events', { params });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch events failed:', err);
      showToast('Failed to load events', false);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => { fetchContent(); }, [filterType, filterCategory, filterSubject, searchContent]);
  useEffect(() => { fetchEvents(); }, [filterEventCat, filterEventStatus, searchEvent]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'events' ? { tab: 'events' } : {});
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('type', type);
      form.append('category', category);
      form.append('subject', subject);
      form.append('description', description);
      form.append('tags', tags);
      form.append('uploaderName', currentUser?.name || 'Faculty');
      form.append('file', file);
      await api.post('/content', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('File uploaded successfully!');
      setTitle(''); setType('Notes'); setCategory('Academic'); setSubject('Computer Science');
      setDescription(''); setTags(''); setFile(null); setShowUploadForm(false);
      fetchContent();
    } catch {
      showToast('Upload failed. Please try again.', false);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item) => {
    setDownloadingId(item._id);
    try {
      const res = await api.get(`/content/download/${item._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = item.originalName || item.title;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Downloaded: ${item.originalName || item.title}`);
      setContents(prev => prev.map(c => c._id === item._id ? { ...c, downloadCount: (c.downloadCount || 0) + 1 } : c));
    } catch {
      showToast('Download failed', false);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = (item) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewItem(null), 300);
    document.body.style.overflow = 'unset';
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await api.delete(`/content/${id}`);
      setContents(prev => prev.filter(c => c._id !== id));
      showToast('Deleted successfully');
    } catch {
      showToast('Delete failed', false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate) return;
    setCreatingEvent(true);
    try {
      await api.post('/events', {
        title: evTitle, description: evDesc, category: evCat,
        date: evDate, time: evTime + ' ' + (parseInt(evTime) >= 12 ? 'PM' : 'AM'),
        location: evLocation || 'Campus', image: evEmoji, maxAttendees: evMax,
        organizerName: currentUser?.name || 'Faculty',
      });
      showToast('Event created successfully!');
      setEvTitle(''); setEvDesc(''); setEvCat('General'); setEvDate('');
      setEvTime('10:00'); setEvLocation(''); setEvMax(100); setEvEmoji('ðŸŽ¯');
      setShowEventForm(false);
      fetchEvents();
    } catch {
      showToast('Failed to create event', false);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleRegister = async (event) => {
    if (!currentUser) { navigate('/login'); return; }
    const isRegistered = event.attendees?.includes(currentUser?.id);
    setRegistering(event._id);
    try {
      if (isRegistered) {
        await api.post(`/events/${event._id}/unregister`);
        showToast('Unregistered from event');
      } else {
        await api.post(`/events/${event._id}/register`);
        showToast('Registered successfully! ðŸŽ‰');
      }
      fetchEvents();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Action failed', false);
    } finally {
      setRegistering(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      showToast('Event deleted');
    } catch {
      showToast('Delete failed', false);
    }
  };

  const canUpload = currentUser && ['faculty', 'admin', 'teacher'].includes(currentUser.role);
  const canDelete = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-slate-900 text-text-primary selection:bg-primary-blue/20 overflow-x-hidden">
      <Header />
      <AnimatePresence>
        {toast && <Toast toast={toast} />}
      </AnimatePresence>

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary-blue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-primary-azure/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* â”€â”€ Preview Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {isPreviewOpen && previewItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="absolute inset-0 bg-blue-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] border border-border-color shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-border-color flex items-center justify-between bg-blue-50/50">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl border ${TYPE_ICON_STYLES[previewItem?.type] || 'bg-blue-50 text-slate-600 border-border-color'}`}>
                    {TYPE_ICONS[previewItem?.type] || <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-text-primary leading-tight mb-1">{previewItem?.title}</h2>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 uppercase tracking-widest">
                      <span>{previewItem?.category}</span>
                      <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                      <span>{formatBytes(previewItem?.size)}</span>
                      <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                      <span className="text-primary-blue">{previewItem?.originalName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => handleDownload(previewItem)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-slate-700 rounded-xl text-sm font-bold transition-all border border-border-color shadow-sm"
                   >
                     <Download className="w-4 h-4 text-primary-blue" /> Download
                   </button>
                   <button 
                    onClick={closePreview}
                    className="p-2.5 bg-blue-50 hover:bg-rose-50 text-slate-600 hover:text-rose-500 rounded-xl transition-all border border-border-color shadow-sm"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* AI Insights Bar */}
              <div className="px-8 py-5 bg-gradient-to-r from-primary-blue/10 to-transparent border-b border-border-color flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-2 text-primary-blue font-black text-xs uppercase tracking-[0.2em] mb-2">
                       <Sparkles className="w-4 h-4" /> AI Document Context
                    </div>
                    {previewItem?.summary ? (
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {previewItem.summary}
                       </p>
                    ) : (
                       <p className="text-sm text-slate-600 font-medium italic">Extracting intelligence... summaries are generated during initial ingestion.</p>
                    )}
                 </div>
                 <button 
                    onClick={() => {
                        closePreview();
                        navigate('/ai-chat', { state: { documentId: previewItem?._id, contextTitle: previewItem?.title } });
                    }}
                    className="flex shrink-0 items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-2xl shadow-xl shadow-primary-blue/20 font-bold text-sm transition-all active:scale-95 group border border-white/10"
                 >
                    <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Chat with AI
                 </button>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 overflow-hidden bg-blue-50 relative group">
                {previewItem?.mimetype?.includes('pdf') ? (
                  <iframe
                    src={`${api.defaults.baseURL}/content/view/${previewItem?._id}#toolbar=0`}
                    className="w-full h-full border-none"
                    title={previewItem?.title}
                  />
                ) : previewItem?.mimetype?.includes('image') ? (
                  <div className="w-full h-full flex items-center justify-center p-12">
                    <img 
                      src={`${api.defaults.baseURL}/content/view/${previewItem?._id}`}
                      alt={previewItem?.title}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-white"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-12 text-center">
                    <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-border-color animate-float shadow-xl">
                       <AlertTriangle className="w-14 h-14 text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Preview Restricted</h3>
                      <p className="text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                        This specialized format ({previewItem?.mimetype?.split('/')[1]?.toUpperCase()}) is optimized for local processing. Download it to access full content.
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDownload(previewItem)}
                      className="flex items-center gap-3 px-10 py-4 bg-primary-blue text-white rounded-2xl font-bold shadow-xl shadow-primary-blue/20 transition-all active:scale-95 border border-white/10"
                    >
                       <Download className="w-5 h-5" /> Download & View
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="px-8 py-5 bg-blue-50/50 border-t border-border-color flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 <div className="flex items-center gap-8">
                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Indexed: {formatDate(previewItem?.createdAt)}</span>
                    <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary-blue" /> {previewItem?.views || 0} Synchronizations</span>
                 </div>
                 <div className="text-slate-500">
                    AI College Management Protocol v2.5
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">

        {/* â”€â”€ Header Area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-black uppercase tracking-widest mb-4">
              <Database className="w-3.5 h-3.5" /> Unified Content Hub
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3 text-text-primary">
              Knowledge <span className="text-primary-blue">Repository</span>
            </h1>
            <p className="text-slate-600 font-medium text-lg">Central hub for academic assets and campus engagement.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-border-color shadow-xl">
            {[
              { id: 'materials', label: 'Materials', icon: <Library className="w-4 h-4" /> },
              { id: 'events',    label: 'Events',    icon: <Calendar className="w-4 h-4" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary-blue text-white shadow-xl shadow-primary-blue/20'
                    : 'text-slate-600 hover:text-slate-700 hover:bg-blue-50'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* â”€â”€ Materials Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'materials' && (
          <div className="animate-fadeIn">
            {/* Search & Global Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
               <div className="lg:col-span-3">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -tranblue-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary-blue transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search the global academic library..." 
                      value={searchContent} 
                      onChange={e => setSearchContent(e.target.value)}
                      className="w-full h-16 bg-white border border-border-color rounded-2xl pl-16 pr-6 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all text-lg font-medium shadow-sm" 
                    />
                  </div>
               </div>
               <div className="lg:col-span-1 flex items-center justify-end">
                  {canUpload ? (
                    <button onClick={() => setShowUploadForm(!showUploadForm)}
                      className={`flex w-full h-16 items-center justify-center gap-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${showUploadForm ? 'bg-blue-50 border border-border-color text-slate-700' : 'bg-primary-blue border border-primary-blue text-white shadow-primary-blue/20 hover:bg-primary-navy'}`}>
                      {showUploadForm ? <><X className="w-5 h-5" /> Close Portal</> : <><UploadCloud className="w-5 h-5" /> Index File</>}
                    </button>
                  ) : !currentUser && (
                    <button onClick={() => navigate('/login')} className="w-full h-16 bg-white hover:bg-blue-50 text-slate-700 border border-border-color rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-sm">
                       <User className="w-4 h-4 text-primary-blue" /> Access Portal to Upload
                    </button>
                  )}
               </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
               <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-border-color overflow-x-auto no-scrollbar shadow-sm">
                  {['All', ...CONTENT_CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)}
                      className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        filterCategory === cat
                          ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/20'
                          : 'text-slate-600 hover:text-slate-700 hover:bg-blue-50'
                      }`}>
                      {cat !== 'All' && CATEGORY_ICONS[cat]}
                      {cat}
                    </button>
                  ))}
               </div>
               
               <div className="flex-1 flex flex-wrap gap-3">
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="flex-1 min-w-[140px] px-4 py-3 bg-white border border-border-color rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 shadow-sm appearance-none cursor-pointer">
                    <option value="All">All Formats</option>
                    {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                    className="flex-1 min-w-[140px] px-4 py-3 bg-white border border-border-color rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 shadow-sm appearance-none cursor-pointer">
                    <option value="All">All Departments</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            {/* Upload Form Modal Context */}
            <AnimatePresence>
              {showUploadForm && canUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-12 overflow-hidden"
                >
                  <div className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <div className="flex items-center gap-4 mb-10 relative z-10">
                       <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center border border-primary-blue/20 shadow-sm">
                          <UploadCloud className="w-7 h-7 text-primary-blue" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black text-text-primary tracking-tight">Index New Asset</h2>
                          <p className="text-slate-600 font-medium">Distribute knowledge to the global campus network.</p>
                       </div>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-8 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Document Title</label>
                             <input type="text" placeholder="e.g. Adv. Database Systems - Ch 4" value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full bg-blue-50 border border-border-color rounded-xl px-5 py-3.5 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-bold" required />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Type</label>
                                <select value={type} onChange={e => setType(e.target.value)}
                                  className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none">
                                  {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Department</label>
                                <select value={subject} onChange={e => setSubject(e.target.value)}
                                  className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none">
                                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Description</label>
                             <textarea placeholder="Briefly define the context of this resource..." value={description} onChange={e => setDescription(e.target.value)}
                                rows={4} className="w-full bg-blue-50 border border-border-color rounded-2xl px-5 py-4 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all resize-none leading-relaxed" />
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Discovery Tags</label>
                             <input type="text" placeholder="Separate with commas..." value={tags} onChange={e => setTags(e.target.value)}
                                className="w-full bg-blue-50 border border-border-color rounded-xl px-5 py-3.5 text-text-primary placeholder:text-slate-600 focus:outline-none focus:bg-white transition-all" />
                           </div>

                           <div onClick={() => document.getElementById('fileInput').click()}
                            className={`relative group border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-border-color bg-blue-50/50 hover:border-primary-blue hover:bg-primary-blue/5'}`}>
                            <div className="relative z-10">
                              <div className="mb-6">
                                {file
                                  ? <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl"><CheckCircle className="w-10 h-10 text-white" /></div>
                                  : <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto border border-border-color group-hover:scale-110 transition-transform shadow-sm"><UploadCloud className="w-10 h-10 text-primary-blue animate-float" /></div>}
                              </div>
                              <div className="text-text-primary text-lg font-black tracking-tight">{file ? file.name : 'Target Asset Source'}</div>
                              <div className="text-slate-600 text-sm font-medium mt-2">PDF, DOC, PPT, ZIP up to 50MB</div>
                            </div>
                            <input id="fileInput" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                          </div>

                          <button type="submit" disabled={uploading || !file}
                            className="w-full h-16 bg-gradient-to-r from-primary-navy to-primary-blue hover:shadow-primary-blue/30 disabled:opacity-30 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3 border border-white/10">
                            {uploading ? <div className="flex items-center gap-2 animate-pulse"><Zap className="w-5 h-5" /> Synchronizing...</div> : <><Upload className="w-5 h-5" /> Start Injection</>}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingContent ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border-color flex flex-col gap-6 shadow-sm">
                    <div className="flex gap-4">
                       <div className="w-16 h-16 bg-blue-100 rounded-2xl shimmer" />
                       <div className="flex-1 space-y-3 pt-2">
                          <div className="h-4 w-3/4 bg-blue-100 rounded-full shimmer" />
                          <div className="h-3 w-1/2 bg-blue-100 rounded-full shimmer" />
                       </div>
                    </div>
                    <div className="h-24 bg-blue-100 rounded-2xl shimmer" />
                  </div>
                ))
              ) : contents.length > 0 ? (
                contents.map((item, idx) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] hover:bg-blue-50 transition-all duration-500 group border border-border-color relative flex flex-col shadow-xl hover:shadow-2xl hover:-tranblue-y-1"
                  >
                    <div className="flex items-start gap-5 mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm ${TYPE_ICON_STYLES[item.type] || 'bg-blue-50 border-border-color text-slate-600'}`}>
                        {TYPE_ICONS[item.type] || <FileText className="w-7 h-7" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-black text-text-primary text-lg leading-tight line-clamp-2 transition-colors mb-2 group-hover:text-primary-blue">{item.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${CATEGORY_STYLES[item.category] || CATEGORY_STYLES.General}`}>
                            {item.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed line-clamp-2 italic opacity-80">
                       {item.description || "Synthesizing document context... Access digital asset for detailed academic insights and learning structures."}
                    </p>

                    <div className="mt-auto space-y-6">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-600">
                          <div className="flex items-center gap-4">
                             <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-azure" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-primary-azure" /> {formatBytes(item.size)}</span>
                          </div>
                          <span className="text-primary-blue/60 transition-colors group-hover:text-primary-blue">{item.views || 0} Synced</span>
                       </div>

                       <div className="flex items-center gap-3">
                          <button onClick={() => handlePreview(item)} className="flex-1 h-12 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-xl shadow-primary-blue/20 flex items-center justify-center gap-2 border border-white/10">
                             <Zap className="w-4 h-4" /> Open Asset
                          </button>
                          <button onClick={() => handleDownload(item)} className="w-12 h-12 bg-blue-50 hover:bg-blue-100 text-slate-600 hover:text-primary-blue rounded-xl transition-all border border-border-color flex items-center justify-center shadow-sm">
                             <Download className="w-5 h-5" />
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDeleteContent(item._id)} className="w-12 h-12 bg-blue-50 hover:bg-rose-50 text-slate-600 hover:text-rose-500 rounded-xl transition-all border border-border-color flex items-center justify-center shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-border-color shadow-sm">
                    <FolderOpen className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-3xl font-black text-text-primary mb-2">Null Knowledge Pointer</h3>
                  <p className="text-slate-600 font-medium max-w-sm mx-auto">No assets found matching your synchronization parameters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ Events Interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'events' && (
          <div className="animate-fadeIn">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
               <div className="flex-1 min-w-[300px]">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -tranblue-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary-blue transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search upcoming campus activities..." 
                      value={searchEvent} 
                      onChange={e => setSearchEvent(e.target.value)}
                      className="w-full h-16 bg-white border border-border-color rounded-2xl pl-16 pr-6 text-text-primary placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-medium shadow-sm" 
                    />
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4">
                  <select value={filterEventStatus} onChange={e => setFilterEventStatus(e.target.value)}
                    className="h-16 px-6 bg-white border border-border-color rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 shadow-sm appearance-none cursor-pointer">
                    <option value="upcoming">Upcoming Flow</option>
                    <option value="past">Archive Flow</option>
                    <option value="All">Total Spectrum</option>
                  </select>
                  {canUpload && (
                    <button onClick={() => setShowEventForm(!showEventForm)}
                      className={`flex h-16 items-center px-10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${showEventForm ? 'bg-blue-50 border border-border-color text-slate-700' : 'bg-gradient-to-r from-primary-navy to-primary-blue text-white shadow-primary-blue/20 hover:shadow-primary-blue/40 border border-white/10'}`}>
                      {showEventForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Schedule Event</>}
                    </button>
                  )}
               </div>
            </div>

            {/* Event Category Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-12 p-1.5 bg-white rounded-2xl border border-border-color w-fit shadow-sm">
              {['All', ...EVENT_CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setFilterEventCat(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filterEventCat === cat
                        ? `bg-primary-blue text-white shadow-lg shadow-primary-blue/20`
                        : 'text-slate-600 hover:text-slate-700 hover:bg-blue-50'
                    }`}>
                    {cat}
                  </button>
                ))}
            </div>

            <AnimatePresence>
              {showEventForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-12 overflow-hidden">
                  <div className="bg-bg-card dark:bg-slate-800 p-10 rounded-[3rem] border border-border-color shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-black text-text-primary mb-8 tracking-tight flex items-center gap-4 relative z-10">
                       <span className="p-3 bg-primary-blue/10 rounded-2xl border border-primary-blue/20 shadow-sm"><Calendar className="w-8 h-8 text-primary-blue" /></span>
                       Initialize Event Protocol
                    </h2>
                    <form onSubmit={handleCreateEvent} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <input type="text" placeholder="Activity Identifier (Title) *" value={evTitle} onChange={e => setEvTitle(e.target.value)}
                              className="w-full bg-blue-50 border border-border-color rounded-xl px-5 py-3.5 text-text-primary placeholder:text-slate-600 font-bold focus:outline-none focus:bg-white transition-all shadow-sm" required />
                            <textarea placeholder="Event Abstract / Parameters..." value={evDesc} onChange={e => setEvDesc(e.target.value)}
                               rows={3} className="w-full bg-blue-50 border border-border-color rounded-xl px-5 py-3.5 text-text-primary placeholder:text-slate-600 font-medium focus:outline-none focus:bg-white transition-all resize-none shadow-sm" />
                            <div className="grid grid-cols-2 gap-4">
                               <input type="date" value={evDate} onChange={e => setEvDate(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white shadow-sm" required />
                               <input type="time" value={evTime} onChange={e => setEvTime(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white shadow-sm" />
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <select value={evCat} onChange={e => setEvCat(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white shadow-sm">
                                 {EVENT_CATEGORIES.map(c => <option key={c} className="bg-white">{c}</option>)}
                               </select>
                               <input type="number" placeholder="Max Attendees" value={evMax} onChange={e => setEvMax(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white shadow-sm" />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                               <input type="text" placeholder="Sector (Location)" value={evLocation} onChange={e => setEvLocation(e.target.value)}
                                 className="w-full bg-blue-50 border border-border-color rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white shadow-sm" />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Visual Marker</label>
                               <div className="flex flex-wrap gap-2">
                                  {EVENT_EMOJIS.map(em => (
                                    <button key={em} type="button" onClick={() => setEvEmoji(em)}
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${evEmoji === em ? 'bg-primary-blue text-white scale-110 shadow-lg shadow-primary-blue/30' : 'bg-blue-50 hover:bg-blue-100 grayscale hover:grayscale-0'}`}>
                                      {em}
                                    </button>
                                  ))}
                               </div>
                            </div>
                            <button type="submit" disabled={creatingEvent}
                              className="w-full h-16 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl hover:shadow-primary-blue/30 flex items-center justify-center gap-3 border border-white/10">
                               {creatingEvent ? <Zap className="w-5 h-5 animate-pulse" /> : <><Plus className="w-5 h-5" /> Deploy Event</>}
                            </button>
                         </div>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events Grid Wrapper */}
            <div className="min-h-[400px]">
              {loadingEvents ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-bg-card dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shimmer p-10 border border-border-color shadow-sm" style={{ height: 450 }} />
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.map((event, idx) => {
                    const styles = EVENT_CAT_STYLES[event.category] || EVENT_CAT_STYLES.General;
                    const isRegistered = event.attendees?.includes(currentUser?.id);
                    const isFull = event.attendees?.length >= event.maxAttendees;
                    const isPast = event.status === 'past';

                    return (
                      <motion.div 
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-bg-card dark:bg-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-blue-50 border border-border-color relative group flex flex-col shadow-xl hover:shadow-2xl hover:-tranblue-y-2"
                      >
                        {/* Event Banner */}
                        <div className={`bg-gradient-to-br ${styles.bg} h-40 flex items-center justify-center text-7xl relative`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-opacity" />
                          <span className="relative z-10 group-hover:scale-125 transition-transform duration-700 drop-shadow-2xl">{event.image || 'ðŸŽ¯'}</span>
                          {isPast && (
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-lg">ARCHIVED</div>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDeleteEvent(event._id)}
                              className="absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-rose-500 text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-6">
                             <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${styles.badge}`}>{event.category}</span>
                             {isFull && !isRegistered && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Capacity Reached</span>}
                          </div>
                          
                          <h3 className="text-2xl font-black text-text-primary mb-3 line-clamp-2 leading-tight group-hover:text-primary-blue transition-colors">{event.title}</h3>
                          <p className="text-slate-600 font-medium text-sm mb-8 line-clamp-2 leading-relaxed italic opacity-80">{event.description || "Synchronizing event abstract with campus protocols... Active participation is required for intellectual credit."}</p>

                          <div className="space-y-3 mb-8">
                             <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <Calendar className="w-4 h-4 text-primary-blue" /> {formatDate(event.date)}
                             </div>
                             <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <Clock className="w-4 h-4 text-primary-azure" /> {event.time || "Scheduled Timing"}
                             </div>
                             <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <MapPin className="w-4 h-4 text-primary-azure" /> {event.location || "Campus Sector"}
                             </div>
                          </div>

                          <div className="mt-auto space-y-4">
                             <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                   <Users className="w-3.5 h-3.5 text-primary-blue" /> {event.attendees?.length || 0} / {event.maxAttendees}
                                </div>
                                <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden shadow-inner">
                                   <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, ((event.attendees?.length || 0) / event.maxAttendees) * 100)}%` }}
                                      className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-primary-blue'}`}
                                   />
                                </div>
                             </div>

                             {!isPast ? (
                               <button
                                 onClick={() => handleRegister(event)}
                                 disabled={registering === event._id || (isFull && !isRegistered)}
                                 className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                                   isRegistered
                                     ? 'bg-white border border-border-color text-emerald-500 hover:bg-blue-50'
                                     : isFull
                                     ? 'bg-blue-100 text-slate-600 cursor-not-allowed border border-border-color shadow-none'
                                     : `bg-gradient-to-r from-primary-navy to-primary-blue text-white shadow-primary-blue/20 hover:shadow-primary-blue/40 border border-white/10`
                                 }`}>
                                 {registering === event._id ? <Zap className="w-5 h-5 animate-pulse" /> : 
                                  isRegistered ? <><CheckCircle className="w-4 h-4" /> Sync Verified</> : 
                                  isFull ? 'Status: Max Cap' : 
                                  <><Plus className="w-4 h-4" /> Request Entry</>}
                               </button>
                             ) : (
                               <div className="w-full py-3 text-center text-[10px] font-black text-slate-600 bg-blue-50 border border-border-color rounded-xl uppercase tracking-widest">
                                  Protocol Finalized
                               </div>
                             )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-40 text-center">
                   <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-border-color shadow-sm">
                      <Calendar className="w-10 h-10 text-slate-500" />
                   </div>
                   <h3 className="text-3xl font-black text-text-primary mb-2">Event Horizon Empty</h3>
                   <p className="text-slate-600 font-medium max-w-sm mx-auto">No future activities detected in the campus stream.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
