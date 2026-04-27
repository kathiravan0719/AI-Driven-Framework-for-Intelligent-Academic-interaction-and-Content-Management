import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle, KeyRound } from "lucide-react";
import Header from "../components/Header";
import api from "../config/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = check inbox

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setMessage("Password reset link has been sent to your email.");
        setStep(2);
        setEmail("");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-bg-card dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl border border-border-color animate-fadeInUp">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${step >= 1 ? 'text-primary-blue' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg ${step >= 1 ? 'bg-gradient-to-br from-primary-navy to-primary-blue' : 'bg-blue-200'}`}>1</div>
              <span className="hidden sm:inline">Initialize</span>
            </div>
            <div className={`w-10 h-0.5 ${step >= 2 ? 'bg-primary-blue' : 'bg-blue-100'} rounded-full`} />
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${step >= 2 ? 'text-primary-blue' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg ${step >= 2 ? 'bg-gradient-to-br from-primary-navy to-primary-blue' : 'bg-blue-200'}`}>2</div>
              <span className="hidden sm:inline">Verify</span>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-blue/10 shadow-sm">
                  <KeyRound className="w-8 h-8 text-primary-blue" />
                </div>
                <h1 className="text-2xl font-black text-text-primary mb-2 tracking-tight">Identity Recovery</h1>
                <p className="text-slate-500 text-sm font-medium">Enter your email and we'll send you a secure reset link</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-shakeX flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -tranblue-y-1/2 group-focus-within:text-primary-blue transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:ring-4 focus:ring-primary-blue/10 focus:bg-white focus:border-primary-blue/20 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                    loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-2xl hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synchronizing...</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Reset Link</>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Check Inbox */
            <div className="text-center animate-scaleIn">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Transmission Complete</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                {message || "We've sent a password reset link to your email address. The link will expire in 10 minutes."}
              </p>
              <div className="bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl p-6 mb-8 text-[11px] text-slate-500 font-bold leading-relaxed">
                💡 Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => setStep(1)} className="text-primary-blue hover:underline">try again</button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center border-t border-blue-50 pt-8">
            <Link
              to="/login"
              className="text-[10px] font-black text-text-secondary hover:text-primary-blue uppercase tracking-[0.2em] transition flex items-center justify-center gap-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-tranblue-x-1 transition-transform" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;