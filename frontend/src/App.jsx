import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Bot, Sparkles, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy load all pages for optimal performance
const Home = lazy(() => import('./Pages/home'));
const Feed = lazy(() => import('./Pages/Feed'));
const PostDetail = lazy(() => import('./Pages/PostDetail'));
const Profile = lazy(() => import('./Pages/Profile'));
const Login = lazy(() => import('./Pages/Login'));
const Signup = lazy(() => import('./Pages/Signup'));
const Topics = lazy(() => import('./Pages/Topics'));
const Events = lazy(() => import('./Pages/Events'));
const About = lazy(() => import('./Pages/About'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Analytics = lazy(() => import('./Pages/Analytics'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/ResetPassword'));
const ContentManagement = lazy(() => import('./Pages/ContentManagement'));
const Chat = lazy(() => import('./Pages/Chat'));
const AIChat = lazy(() => import('./Pages/AIChat'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));

// Neural Loader Component for Suspense
const NeuralLoader = () => (
    <div className="fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-primary-blue/10 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[30%] right-[20%] w-64 h-64 bg-primary-azure/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>
        <div className="relative flex flex-col items-center">
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="relative w-24 h-24 mb-10"
            >
               <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
               <div className="absolute inset-0 border-t-4 border-primary-blue rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
               <div className="absolute inset-4 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-primary-blue opacity-50" />
               </div>
            </motion.div>
            <div className="flex flex-col items-center gap-2">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-blue/5 border border-primary-blue/10 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-primary-blue animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-blue">Initializing Core</span>
               </div>
               <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-4">Syncing with Campus Knowledge Network...</p>
            </div>
        </div>
    </div>
);

const FloatingBot = () => {
    const location = useLocation();
    if (location.pathname === '/ai-chat') return null;

    return (
        <Link
            to="/ai-chat"
            title="AI Assistant"
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-navy via-primary-blue to-primary-azure text-white rounded-2xl shadow-2xl hover:shadow-primary-blue/40 hover:scale-110 transition-all z-40 flex items-center justify-center animate-bounce duration-1000 group border border-white/20"
            style={{ animationIterationCount: 1 }}
        >
            <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
        </Link>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="selection:bg-primary-blue/20 selection:text-primary-navy">
                        <Suspense fallback={<NeuralLoader />}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/feed" element={<Feed />} />
                                <Route path="/post/:id" element={<PostDetail />} />
                                <Route path="/profile/:id" element={<Profile />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/topics" element={<Topics />} />
                                <Route path="/events" element={<Events />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/content" element={<ContentManagement />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/chat/:userId" element={<Chat />} />
                                <Route path="/ai-chat" element={<AIChat />} />
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>

                            <FloatingBot />
                            <CommandPalette />
                        </Suspense>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;