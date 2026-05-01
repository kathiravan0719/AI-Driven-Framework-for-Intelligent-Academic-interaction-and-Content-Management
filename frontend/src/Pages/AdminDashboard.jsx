import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, FileText, Download, Eye, Zap, TrendingUp, AlertTriangle, 
  PieChart as PieChartIcon, Calendar, CheckCircle, Trash2, Check, X, 
  Shield, FolderOpen, ClipboardList, Filter, Search, Activity, Cpu, Database, ChevronRight
} from 'lucide-react';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const { currentUser, socket } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'content', 'audit'

  // --- Shared Admin State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // --- Analytics State ---
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalDownloads: 0,
    activeUsers: 0,
    totalUsers: 0,
    aiQueries: 0,
    categoryDistribution: []
  });
  const [topContent, setTopContent] = useState([]);

  // --- Users State ---
  const [allUsers, setAllUsers] = useState([]);

  // --- Content State ---
  const [allContent, setAllContent] = useState([]);

  // --- Audit Logs State ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('All');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('All');
  const [auditSearch, setAuditSearch] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Real-time socket updates for active users
  useEffect(() => {
    if (socket) {
      const handleOnlineUsers = (users) => {
        setStats(prev => ({ ...prev, activeUsers: users.length }));
      };
      socket.on('online-users', handleOnlineUsers);
      return () => socket.off('online-users', handleOnlineUsers);
    }
  }, [socket]);

  // Fetch data depending on active tab
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    const fetchTab = async () => {
      setLoading(true);
      try {
        if (activeTab === 'analytics') {
          const [statsRes, contentRes] = await Promise.all([
            api.get(`/admin/stats?range=${dateRange}`),
            api.get('/admin/top-content')
          ]);
          setStats(statsRes.data);
          setTopContent(contentRes.data);
        } else if (activeTab === 'users') {
          const res = await api.get('/users');
          setAllUsers(res.data);
        } else if (activeTab === 'content') {
          const res = await api.get('/content?all=true');
          setAllContent(res.data);
        } else if (activeTab === 'audit') {
          const res = await api.get(`/admin/audit-logs?page=${auditPage}&limit=15&actionType=${auditActionFilter}&severity=${auditSeverityFilter}&search=${auditSearch}`);
          setAuditLogs(res.data.logs);
          setAuditTotalPages(res.data.pages);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Connection interrupted with the Neural Core. Ensure your authorization is valid.');
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchTab();
    }, activeTab === 'audit' && auditSearch ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [currentUser, activeTab, dateRange, auditPage, auditActionFilter, auditSeverityFilter, auditSearch]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Action Handlers ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Authorize full identity deletion protocol?")) return;
    try {
      await api.delete(`/users/${id}`);
      setAllUsers(prev => prev.filter(u => (u._id || u.id) !== id));
      showToast("Identity successfully purged.");
    } catch {
      showToast("Deletion protocol failed.", false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      setAllUsers(prev => prev.map(u => (u._id || u.id) === id ? { ...u, role: newRole } : u));
      showToast(`User clearance updated to ${newRole}.`);
    } catch {
      showToast("Role update failed.", false);
    }
  };

  const handleApproveContent = async (id) => {
    try {
      await api.patch(`/content/${id}/approve`);
      setAllContent(prev => prev.map(c => c._id === id ? { ...c, isApproved: true } : c));
      showToast("Content authorized for system propagation.");
    } catch {
      showToast("Approval protocol failed.", false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Authorize resource deletion?")) return;
    try {
      await api.delete(`/content/${id}`);
      setAllContent(prev => prev.filter(c => c._id !== id));
      showToast("Resource purged from knowledge base.");
    } catch {
      showToast("Resource deletion failed.", false);
    }
  };

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(number || 0);
  };

  const MemoizedBarChart = useMemo(() => {
    if (!topContent.length) return <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">No signal data detected</div>;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topContent} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="title" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontBold: true }} 
            tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '..' : val}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontBold: true }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
            itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '11px' }} 
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
          />
          <Bar name="Reach" dataKey="views" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={24} />
          <Bar name="Syncs" dataKey="downloadCount" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [topContent]);

  const MemoizedPieChart = useMemo(() => {
    if (!stats.categoryDistribution?.length) return <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Sector data null</div>;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={stats.categoryDistribution} innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
            {stats.categoryDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
             itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '11px' }} 
          />
          <Legend verticalAlign="bottom" height={40} iconType="circle" formatter={(value) => <span className="text-slate-600 font-black text-[9px] uppercase tracking-widest">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [stats.categoryDistribution]);

  const statCards = [
    { title: 'Knowledge Sources', value: stats.totalContent, icon: <FileText className="w-5 h-5 text-primary-blue" />, glow: 'shadow-primary-blue/5' },
    { title: 'System Reach', value: stats.totalViews, icon: <Eye className="w-5 h-5 text-primary-azure" />, glow: 'shadow-primary-azure/5' },
    { title: 'Neural Syncs', value: stats.totalDownloads, icon: <Download className="w-5 h-5 text-emerald-500" />, glow: 'shadow-emerald-500/5' },
    { title: 'Scholar Count', value: stats.totalUsers, icon: <Users className="w-5 h-5 text-amber-500" />, glow: 'shadow-amber-500/5' },
    { title: 'Neural Queries', value: stats.aiQueries, icon: <Zap className="w-5 h-5 text-pink-500" />, glow: 'shadow-pink-500/5' },
    { title: 'Core Activity', value: stats.activeUsers, icon: <Activity className="w-5 h-5 text-rose-500" />, glow: 'shadow-rose-500/5', animate: true }
  ];

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-bg-primary text-slate-900 selection:bg-primary-blue/10 overflow-x-hidden">
      <Header />

      {/* Subtle Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] bg-primary-blue/5 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-primary-azure/5 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      {/* Admin Toast */}
      <AnimatePresence>
      {toast && (
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 20 }}
           className={`fixed top-24 right-6 z-[100] px-8 py-5 rounded-2xl shadow-2xl backdrop-blur-2xl border font-black flex items-center gap-4 ${toast.ok ? 'bg-white/90 border-primary-blue/10 text-primary-blue' : 'bg-white/90 border-rose-100 text-rose-600'}`}
        >
           {toast.ok ? <CheckCircle className="w-5 h-5 text-primary-blue" /> : <AlertTriangle className="w-5 h-5 text-rose-500" />}
           <span className="tracking-tight text-sm uppercase tracking-[0.2em]">{toast.msg}</span>
        </motion.div>
      )}
      </AnimatePresence>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary-blue/5 border border-primary-blue/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary-blue mb-8 shadow-sm">
               <Shield className="w-4 h-4 animate-pulse" /> High-Clearance Protocol
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              Intelligence <span className="text-primary-blue">Command.</span>
            </h1>
            <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-3 ml-1">
               Central Oversight Console • <span className="text-primary-blue animate-pulse font-black">Admin Clearance Verified</span>
            </p>
          </motion.div>

          {activeTab === 'analytics' && (
            <div className="bg-white flex items-center border border-blue-100 rounded-2xl p-1.5 shadow-xl">
               <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 ml-1">
                 <Calendar className="w-4 h-4 text-primary-blue" />
               </div>
               <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 focus:outline-none appearance-none cursor-pointer"
               >
                  <option value="7d">Last 7 Cycles</option>
                  <option value="30d">Last 30 Cycles</option>
                  <option value="all">Full History</option>
               </select>
            </div>
          )}
        </div>

        {/* Neural Tab Navigation */}
        <div className="bg-white rounded-[3.5rem] border border-blue-100 p-2.5 mb-16 inline-flex items-center gap-2 shadow-xl relative overflow-x-auto max-w-full no-scrollbar group">
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<TrendingUp className="w-4 h-4" />} label="Metrics" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Scholars" />
          <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<FolderOpen className="w-4 h-4" />} label="Moderation" />
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<ClipboardList className="w-4 h-4" />} label="Audit Stream" />
        </div>

        {error && (
          <div className="mb-16 p-8 bg-rose-50 border border-rose-100 text-rose-500 rounded-[3rem] flex items-center gap-6 animate-shake shadow-xl">
            <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="font-black uppercase tracking-[0.4em] text-sm">{error}</span>
          </div>
        )}

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              {/* Analytics Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 mb-16">
                {statCards.map((card, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white p-8 rounded-[2.8rem] border border-blue-100 relative overflow-hidden group transition-all hover:scale-[1.05] hover:border-primary-blue/20 shadow-xl ${card.glow}`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="p-4 rounded-2xl bg-blue-50 w-max mb-8 border border-blue-100 group-hover:rotate-12 transition-transform shadow-md">{card.icon}</div>
                    <h3 className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{card.title}</h3>
                    <p className={`text-4xl font-black text-slate-900 tracking-tighter ${card.animate ? 'animate-pulse' : ''}`}>{loading ? '...' : formatCompactNumber(card.value)}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-10 items-stretch">
                <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl min-h-[480px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-12 flex items-center gap-4 relative z-10">
                     <TrendingUp className="w-6 h-6 text-primary-blue" /> Platform Throughput Analysis
                  </h3>
                  <div className="h-[320px] w-full relative z-10">{loading ? <Skeleton h="100%" /> : MemoizedBarChart}</div>
                </div>
                <div className="lg:col-span-1 bg-white p-12 rounded-[3.5rem] border border-blue-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-azure/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
                    <PieChartIcon className="w-6 h-6 text-primary-azure" /> Sector Allocation
                  </h3>
                  <div className="h-[340px] w-full relative z-10">{loading ? <Skeleton circle /> : MemoizedPieChart}</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="bg-white rounded-[3.5rem] border border-blue-100 overflow-hidden shadow-xl">
                <div className="px-12 py-10 border-b border-blue-50 flex justify-between items-center bg-blue-50/50">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                    <Users className="w-6 h-6 text-amber-500" /> Authenticated Scholars
                  </h3>
                  <div className="px-6 py-2.5 bg-primary-blue/5 border border-primary-blue/10 rounded-2xl text-[10px] font-black text-primary-blue uppercase tracking-widest shadow-sm">{allUsers.length} Recorded Identities</div>
                </div>
                <div className="overflow-x-auto min-h-[500px] no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-blue-50 text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">
                      <tr>
                        <th className="px-12 py-8">Signal ID</th>
                        <th className="px-12 py-8">Credentials</th>
                        <th className="px-12 py-8">Init Date</th>
                        <th className="px-12 py-8">Authorization</th>
                        <th className="px-12 py-8 text-right">Terminal Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 text-slate-600">
                      {loading ? (
                        <tr><td colSpan={5} className="px-12 py-32 text-center"><SkeletonTable /></td></tr>
                      ) : allUsers.map((user) => (
                        <tr key={user._id || user.id} className="hover:bg-blue-50 transition-all group/row">
                          <td className="px-12 py-8">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-navy to-primary-blue rounded-2xl flex items-center justify-center text-white font-black text-base border border-white/10 group-hover/row:scale-110 transition-transform shadow-lg">
                                   {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-black text-slate-900 tracking-tighter text-base">{user.name}</span>
                             </div>
                          </td>
                          <td className="px-12 py-8 text-slate-500 font-bold text-sm tracking-tight">{user.email}</td>
                          <td className="px-12 py-8 text-slate-600 font-black text-[10px] uppercase tracking-widest">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="px-12 py-8">
                            <select 
                              value={user.role} 
                              onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                              className="bg-white border border-blue-100 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl px-5 py-3 text-primary-blue focus:ring-2 focus:ring-primary-blue/10 outline-none hover:bg-blue-50 transition-all shadow-sm appearance-none cursor-pointer"
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-12 py-8 text-right space-x-5">
                            <button onClick={() => navigate(`/profile/${user._id || user.id}`)} className="p-3 bg-white border border-blue-100 rounded-xl text-slate-600 hover:text-primary-blue hover:bg-blue-50 transition-all shadow-sm active:scale-90" title="Inspect Interface"><Eye className="w-5 h-5 inline" /></button>
                            <button onClick={() => handleDeleteUser(user._id || user.id)} className="p-3 bg-white border border-blue-100 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm active:scale-90" title="Purge Identity"><Trash2 className="w-5 h-5 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="bg-white rounded-[3.5rem] border border-blue-100 overflow-hidden shadow-xl">
                <div className="px-12 py-10 border-b border-blue-50 flex justify-between items-center bg-blue-50/50">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                    <FolderOpen className="w-6 h-6 text-emerald-500" /> High-Density Knowledge Stream
                  </h3>
                </div>
                <div className="overflow-x-auto min-h-[500px] no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-blue-50 text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">
                      <tr>
                        <th className="px-12 py-8">Source Header</th>
                        <th className="px-12 py-8">Sector</th>
                        <th className="px-12 py-8">Originative</th>
                        <th className="px-12 py-8">Terminal Status</th>
                        <th className="px-12 py-8 text-right">Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 text-slate-600">
                      {loading ? (
                        <tr><td colSpan={5} className="px-12 py-32 text-center"><SkeletonTable /></td></tr>
                      ) : allContent.map((item) => (
                        <tr key={item._id} className="hover:bg-blue-50 transition-all group/row">
                          <td className="px-12 py-8">
                             <div className="flex items-center gap-5 max-w-[340px]">
                                <div className="w-14 h-14 bg-primary-blue/5 rounded-2xl flex items-center justify-center text-primary-blue border border-primary-blue/10 group-hover/row:scale-110 group-hover/row:rotate-3 transition-all duration-700 shadow-sm">
                                   <FileText className="w-7 h-7" />
                                </div>
                                <span className="font-black text-slate-900 truncate text-base tracking-tighter">{item.title}</span>
                             </div>
                          </td>
                          <td className="px-12 py-8 text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]">{item.type}</td>
                          <td className="px-12 py-8 text-slate-500 font-bold text-sm tracking-tight">{item.uploaderName}</td>
                          <td className="px-12 py-8">
                            {item.isApproved ? (
                              <span className="inline-flex px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">Authorized Signal</span>
                            ) : (
                              <span className="inline-flex px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl bg-amber-50 text-amber-600 border border-amber-100 animate-pulse shadow-sm">Pending Auth</span>
                            )}
                          </td>
                          <td className="px-12 py-8 text-right space-x-5">
                            {!item.isApproved && (
                               <button onClick={() => handleApproveContent(item._id)} className="p-3 bg-white border border-blue-100 rounded-xl text-primary-blue hover:text-primary-navy hover:bg-blue-50 transition-all shadow-sm active:scale-90" title="Authorize Sync"><Check className="w-6 h-6 inline" /></button>
                            )}
                            <button onClick={() => window.open(`/api/content/download/${item._id}`)} className="p-3 bg-white border border-blue-100 rounded-xl text-slate-600 hover:text-slate-600 hover:bg-blue-50 transition-all shadow-sm active:scale-90" title="Inspect Source"><Download className="w-6 h-6 inline" /></button>
                            <button onClick={() => handleDeleteContent(item._id)} className="p-3 bg-white border border-blue-100 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm active:scale-90" title="Purge Record"><Trash2 className="w-6 h-6 inline" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
               <div className="grid lg:grid-cols-4 gap-10">
                  <div className="lg:col-span-1 space-y-8">
                     <div className="bg-white p-10 rounded-[3.5rem] border border-blue-100 flex flex-col gap-10 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                           <Filter className="w-6 h-6 text-primary-azure" /> Sync Filters
                        </h3>
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Action Protocol</span>
                              <select value={auditActionFilter} onChange={(e) => { setAuditActionFilter(e.target.value); setAuditPage(1); }} className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 outline-none focus:ring-2 focus:ring-primary-blue/10 transition-all shadow-sm appearance-none cursor-pointer">
                                 <option value="All">All Protocols</option>
                                 <option value="DELETE_USER">Delete User</option>
                                 <option value="UPDATE_ROLE">Update Role</option>
                                 <option value="APPROVE_CONTENT">Approve Content</option>
                                 <option value="DELETE_CONTENT">Delete Content</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Risk Level</span>
                              <select value={auditSeverityFilter} onChange={(e) => { setAuditSeverityFilter(e.target.value); setAuditPage(1); }} className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 outline-none focus:ring-2 focus:ring-primary-blue/10 transition-all shadow-sm appearance-none cursor-pointer">
                                 <option value="All">All Severity</option>
                                 <option value="low">Low Risk</option>
                                 <option value="medium">Medium Risk</option>
                                 <option value="high">High Risk</option>
                              </select>
                           </div>
                        </div>
                     </div>
                     
                     <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-10 rounded-[3.5rem] border border-primary-blue/10 shadow-xl relative overflow-hidden group"
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Database className="w-10 h-10 text-primary-blue mb-8" />
                        <h4 className="font-black text-slate-900 text-lg mb-3 tracking-tighter uppercase">Audit Redundancy</h4>
                        <p className="text-slate-600 text-[11px] leading-relaxed font-bold uppercase tracking-[0.2em]">
                           Every administrative action is permanently hashed into the campus knowledge ledger for security verification and forensic analysis.
                        </p>
                     </motion.div>
                  </div>

                  <div className="lg:col-span-3">
                     <div className="bg-white rounded-[4rem] border border-blue-100 overflow-hidden shadow-xl relative min-h-[700px]">
                        <div className="absolute top-10 right-12 z-20">
                           <div className="flex items-center gap-4 bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm backdrop-blur-md">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Sync Enabled</span>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm"></div>
                           </div>
                        </div>
                        
                        <div className="px-12 py-10 border-b border-blue-50 bg-blue-50/50 flex items-center justify-between">
                           <div className="relative w-full max-w-md">
                              <Search className="w-5 h-5 text-slate-600 absolute left-5 top-1/2 -translate-y-1/2" />
                              <input 
                                 type="text" 
                                 placeholder="Search the audit stream..." 
                                 value={auditSearch}
                                 onChange={(e) => setAuditSearch(e.target.value)}
                                 className="w-full pl-14 pr-6 py-4 bg-white border border-blue-100 rounded-[1.8rem] text-sm font-bold text-slate-900 placeholder-blue-400 outline-none focus:ring-2 focus:ring-primary-blue/10 transition-all shadow-sm"
                              />
                           </div>
                        </div>

                        <div className="p-12 space-y-10 max-h-[800px] overflow-y-auto no-scrollbar relative">
                           <div className="absolute left-[68px] top-12 bottom-12 w-px bg-blue-100 z-0"></div>
                           {loading ? (
                             Array(5).fill(0).map((_, i) => <SkeletonAudit key={i} />)
                           ) : auditLogs.map((log, idx) => (
                              <motion.div 
                                 key={log._id} 
                                 initial={{ opacity: 0, x: -20 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                 className="relative z-10 flex gap-10 items-start group"
                              >
                                 <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                    {log.severity === 'high' ? <AlertTriangle className="w-6 h-6 text-rose-500" /> : <Activity className="w-6 h-6 text-primary-blue" />}
                                 </div>
                                 <div className="flex-1 bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 group-hover:bg-white group-hover:shadow-2xl group-hover:border-primary-blue/10 transition-all">
                                    <div className="flex items-center justify-between mb-6">
                                       <div className="flex items-center gap-4">
                                          <span className="text-slate-900 font-black text-base tracking-tighter">{log.adminName}</span>
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                                          <span className="text-[11px] font-black text-primary-blue uppercase tracking-[0.4em]">{log.actionType}</span>
                                       </div>
                                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                                          {new Date(log.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                    </div>
                                    <div className="text-sm text-slate-500 font-bold mb-6 italic uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                                       Target detected: <span className="text-slate-900 font-black tracking-tight">{log.metadata?.targetName || log.metadata?.targetTitle || log.targetId}</span>
                                    </div>
                                    {(log.metadata?.oldRole || log.metadata?.newRole) && (
                                       <div className="inline-flex gap-5 px-6 py-2.5 bg-white rounded-2xl border border-blue-100 text-[10px] font-black uppercase tracking-[0.3em] italic shadow-sm">
                                          <span className="text-slate-600">{log.metadata.oldRole}</span>
                                          <span className="text-primary-blue animate-pulse">→</span>
                                          <span className="text-primary-blue font-black">{log.metadata.newRole}</span>
                                       </div>
                                    )}
                                    <div className="mt-6 flex justify-end">
                                       {log.severity === 'high' && <span className="text-[9px] font-black uppercase text-rose-600 border border-rose-100 px-3 py-1 rounded-lg bg-rose-50 shadow-sm">Critical Override</span>}
                                    </div>
                                 </div>
                              </motion.div>
                           ))}
                           
                           {auditLogs.length === 0 && !loading && (
                             <div className="py-48 text-center opacity-20">
                                <ClipboardList className="w-20 h-20 mx-auto mb-10 text-slate-500 animate-pulse" />
                                <p className="text-base font-black uppercase tracking-[0.5em] italic">Stream ID: Null - No records synchronized.</p>
                             </div>
                           )}
                        </div>

                        {auditTotalPages > 1 && (
                           <div className="px-12 py-8 border-t border-blue-50 bg-blue-50/50 flex justify-between items-center shadow-inner">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Synchronization Page {auditPage}/{auditTotalPages}</span>
                              <div className="flex gap-5">
                                 <button disabled={auditPage === 1} onClick={() => setAuditPage(p => p - 1)} className="p-3 bg-white rounded-2xl border border-blue-100 text-slate-600 hover:text-primary-blue hover:border-primary-blue/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"><X className="w-5 h-5 rotate-90" /></button>
                                 <button disabled={auditPage === auditTotalPages} onClick={() => setAuditPage(p => p + 1)} className="p-3 bg-white rounded-2xl border border-blue-100 text-slate-600 hover:text-primary-blue hover:border-primary-blue/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"><ChevronRight className="w-5 h-5" /></button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-4 px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 z-10 whitespace-nowrap border ${
        active 
          ? "bg-gradient-to-r from-primary-navy to-primary-blue text-white shadow-xl border-white/10" 
          : "text-slate-600 hover:text-slate-600 border-transparent hover:bg-blue-50"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="tabGlow" className="absolute inset-0 bg-white/10 blur-xl rounded-[2.5rem]" />}
    </button>
  );
}

const Skeleton = ({ circle, h = '20px' }) => (
  <div className={`animate-pulse bg-blue-50 rounded-3xl ${circle ? 'aspect-square rounded-full' : ''} border border-blue-100`} style={{ height: h }}></div>
);

const SkeletonTable = () => (
  <div className="space-y-8 p-6">
    {Array(5).fill(0).map((_, i) => (
      <div key={i} className="flex gap-8 items-center">
         <div className="w-14 h-14 rounded-2xl bg-blue-50 animate-pulse border border-blue-100"></div>
         <div className="h-4 w-64 bg-blue-50 rounded-lg animate-pulse border border-blue-100"></div>
         <div className="ml-auto h-4 w-32 bg-blue-50 rounded-lg animate-pulse border border-blue-100"></div>
      </div>
    ))}
  </div>
);

const SkeletonAudit = () => (
  <div className="flex gap-10 items-start animate-pulse mb-10">
    <div className="w-14 h-14 rounded-2xl bg-blue-50 shrink-0 border border-blue-100"></div>
    <div className="flex-1 p-10 rounded-[3rem] bg-blue-50 h-40 border border-blue-100"></div>
  </div>
);
