import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Aperture, Mail, Lock, User, AlertCircle, ArrowRight, Github } from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../context/ToastContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const getAuthErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'The neural link failed. Incorrect identity or key provided.';
      case 'auth/email-already-in-use':
        return 'This neural pattern already exists in our system.';
      case 'auth/weak-password':
        return 'Your neural key is too weak. Increase complexity for security.';
      case 'auth/too-many-requests':
        return 'Too many failed link attempts. Access locked for security.';
      default:
        return 'Quantum synchronization failed. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (showReset) {
        await resetPassword(email);
        showToast('Password reset link sent to your digital uplink.', 'success');
        setShowReset(false);
      } else if (isLogin) {
        await loginWithEmail(email, password);
        navigate(from, { replace: true });
      } else {
        if (!name) throw new Error('Identity name is required.');
        await registerWithEmail(email, password, name);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-2xl mb-6 shadow-2xl relative"
          >
            <div className="absolute inset-[1px] bg-[#050507] rounded-[15px]" />
            <Aperture className="w-8 h-8 text-white relative animate-[spin_8s_linear_infinite]" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-[-2px] mb-2 uppercase">LUMORA</h1>
          <p className="text-text-dim text-sm tracking-widest font-bold uppercase opacity-60">The future of cinema is here</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] backdrop-blur-3xl rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Form Tabs */}
          {!showReset && (
            <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5 relative">
              <motion.div 
                layoutId="tab"
                className="absolute inset-y-1 bg-white/10 rounded-xl border border-white/10"
                style={{ 
                  left: isLogin ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)' 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button 
                onClick={() => setIsLogin(true)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-colors relative z-10",
                  isLogin ? "text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-colors relative z-10",
                  !isLogin ? "text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                Register
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-white font-black uppercase text-sm tracking-widest mb-4">
              {showReset ? 'Reset Neural Key' : isLogin ? 'Neural Link Login' : 'Pattern Registration'}
            </h2>

            <AnimatePresence mode="wait">
              {!isLogin && !showReset && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Vask"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            {!showReset && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
                   <button 
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-[9px] font-black text-accent-cyan uppercase tracking-widest opacity-60 hover:opacity-100"
                   >
                     Forgot?
                   </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!showReset}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold leading-tight"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-[2px] text-xs flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {showReset ? 'Send Link' : isLogin ? 'Link Now' : 'Join Nexus'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {showReset && (
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full py-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
              >
                Back to Login
              </button>
            )}
          </form>

          {!showReset && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-[#0c0c0f] px-4 text-white/30">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[11px] font-black uppercase tracking-wider">Google</span>
                </button>
                <button className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-white/60 hover:text-white">
                  <Github className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">GitHub</span>
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-8 text-[11px] text-white/30 font-medium">
          Protected by <span className="text-white/60">LUMORA Security</span>. 
          By continuing, you acknowledge our <span className="text-white underline underline-offset-4 cursor-pointer">Protocol Agreement</span>.
        </p>
      </motion.div>
    </div>
  );
}
