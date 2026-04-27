import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle } from "lucide-react";
import Header from "../components/Header";
import api from "../config/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: '', label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 'strength-weak', label: 'Weak', color: 'text-red-500' };
    if (score === 2) return { level: 'strength-fair', label: 'Fair', color: 'text-amber-500' };
    if (score === 3) return { level: 'strength-good', label: 'Good', color: 'text-green-500' };
    return { level: 'strength-strong', label: 'Strong', color: 'text-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });

      if (response.data.success) {
        setMessage("Password reset successful! Redirecting...");

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("currentUser", JSON.stringify(response.data.user));
          setTimeout(() => navigate("/feed"), 2000);
        } else {
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Failed to reset password. The link may be invalid or expired."
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
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-blue/10 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-primary-blue" />
            </div>
            <h1 className="text-2xl font-black text-text-primary mb-2 tracking-tight">Security Update</h1>
            <p className="text-slate-500 text-sm font-medium">Create a new secure password for your account</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-scaleIn">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-shakeX flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">New Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -tranblue-y-1/2 group-focus-within:text-primary-blue transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-bg-tertiary dark:bg-slate-900 border border-border-color rounded-2xl focus:ring-4 focus:ring-primary-blue/10 focus:bg-white focus:border-primary-blue/20 transition-all text-sm font-medium"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -tranblue-y-1/2 text-text-secondary hover:text-primary-blue transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 animate-fadeIn px-1">
                  <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`strength-bar h-full transition-all duration-500 ${strength.level}`} style={{
                        width: strength.level === 'strength-weak' ? '25%' : 
                               strength.level === 'strength-fair' ? '50%' : 
                               strength.level === 'strength-good' ? '75%' : '100%',
                        backgroundColor: strength.level === 'strength-weak' ? '#EF4444' : 
                                         strength.level === 'strength-fair' ? '#F59E0B' : 
                                         strength.level === 'strength-good' ? '#10B981' : '#059669'
                    }} />
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${strength.color.replace('text-', 'text-')}`}>
                    Security Tier: {strength.label}
                  </p>
                </div>
              )}
              <p className="text-[10px] text-text-secondary mt-2 px-1 font-medium">Minimum 6 characters required</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Confirm Identity</label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -tranblue-y-1/2 group-focus-within:text-primary-blue transition-colors" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 border rounded-2xl focus:ring-4 focus:ring-primary-blue/10 focus:bg-white transition-all text-sm font-medium ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 bg-red-50/30'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-border-color bg-bg-tertiary dark:bg-slate-900'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -tranblue-y-1/2 text-text-secondary hover:text-primary-blue transition"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-500 mt-2 px-1 font-bold animate-fadeIn">Signature mismatch</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[10px] text-emerald-600 mt-2 px-1 font-bold animate-fadeIn flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-2xl hover:scale-105"
              }`}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating Protocol...</>
              ) : (
                <><ShieldCheck className="w-3.5 h-3.5" /> Reset Password</>
              )}
            </button>
          </form>

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

export default ResetPassword;