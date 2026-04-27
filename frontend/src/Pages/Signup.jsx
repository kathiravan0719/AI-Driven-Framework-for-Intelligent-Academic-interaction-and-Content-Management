import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, UserPlus, Eye, EyeOff, User, Fingerprint, ArrowRight, Shield, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Security protocol requires minimum 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const success = await signup(name, email, password, role);
      if (success) {
        setToastMessage(`Welcome to the Hub, ${name}! Identity registered.`);
        setShowToast(true);
        setTimeout(() => navigate("/feed"), 2000);
      } else {
        setError("Identity collision detected. Email may already be indexed.");
      }
    } catch (err) {
      setError("Registration sequence failed. Check network link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-slate-900 text-text-primary transition-colors duration-300 selection:bg-primary-blue/20 overflow-x-hidden">
      <Header />
      
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-primary-blue/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary-azure/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-24">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-bg-card dark:bg-slate-800 p-12 rounded-[3.5rem] border border-border-color shadow-xl relative overflow-hidden"
        >
           {/* Visual Decor */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[80px] pointer-events-none"></div>

           {/* Header */}
           <div className="text-center mb-10">
             <div className="relative inline-block mb-8">
               <div className="absolute inset-0 bg-primary-blue rounded-3xl blur-2xl opacity-20"></div>
               <div className="relative w-20 h-20 bg-gradient-to-br from-primary-navy via-primary-blue to-primary-azure rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-white/10">
                 <UserPlus className="w-9 h-9 text-white" />
               </div>
             </div>
             <h1 className="text-4xl font-black text-text-primary mb-3 tracking-tighter">Identity Registration</h1>
             <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[10px]">Create Your Academic Profile</p>
           </div>

           {error && (
             <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4"
             >
               <div className="w-8 h-8 bg-rose-500/20 rounded-xl flex items-center justify-center shrink-0 border border-rose-500/30">!</div>
               {error}
             </motion.div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
               <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Full Name</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-text-secondary group-focus-within:text-primary-blue transition-colors" />
                 </div>
                 <input
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   placeholder="Enter your name"
                   className="w-full pl-14 pr-5 h-14 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-sm font-bold text-text-primary placeholder:text-text-secondary"
                   required
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Email Address</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-secondary group-focus-within:text-primary-blue transition-colors" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@college.edu"
                   className="w-full pl-14 pr-5 h-14 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-sm font-bold text-text-primary placeholder:text-text-secondary"
                   required
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Role Selection</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Fingerprint className="w-5 h-5 text-text-secondary group-focus-within:text-primary-blue transition-colors" />
                 </div>
                 <select
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full pl-14 pr-10 h-14 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                 >
                   <option value="student" className="bg-white">Student</option>
                   <option value="faculty" className="bg-white">Faculty</option>
                   <option value="admin" className="bg-white">Admin</option>
                 </select>
                 <div className="absolute right-5 top-1/2 -tranblue-y-1/2 pointer-events-none text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
             </div>

             <div className="space-y-2">
               <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-2">Password</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-secondary group-focus-within:text-primary-blue transition-colors" />
                 </div>
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Create cipher"
                   className="w-full pl-14 pr-14 h-14 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-sm font-bold text-text-primary placeholder:text-text-secondary"
                   required
                   minLength={6}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-5 top-1/2 -tranblue-y-1/2 text-text-secondary hover:text-primary-blue transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
               <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-2 mt-3 flex items-center gap-2">
                 <Sparkles className="w-3 h-3" /> Security: Minimum 6 chars
               </p>
             </div>

             <button
               type="submit"
               disabled={loading}
               className={`group w-full h-14 bg-gradient-to-r from-primary-navy via-primary-blue to-primary-azure text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl mt-8 ${
                 loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 border border-white/20 shadow-primary-blue/30"
               }`}
             >
               {loading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Indexing Identity...
                 </>
               ) : (
                 <>
                   Generate Identity <ArrowRight className="w-5 h-5 group-hover:tranblue-x-1 transition-transform" />
                 </>
               )}
             </button>
           </form>

           <div className="mt-12 pt-8 border-t border-border-color text-center">
             <p className="text-text-secondary font-bold text-[11px] uppercase tracking-widest">
               Already Registered?{" "}
               <Link to="/login" className="text-primary-blue font-black transition-colors ml-2 hover:underline underline-offset-8">
                 Authenticate
               </Link>
             </p>
           </div>
        </motion.div>
        
        {/* Verification Tag */}
        <div className="mt-10 flex items-center justify-center gap-4 opacity-20 hover:opacity-100 transition-all duration-1000 group">
           <Shield className="w-5 h-5 text-primary-blue group-hover:scale-110 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">Protocol Verified Node - Access Granted</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
