import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { motion } from 'motion/react';
import { MOCK_CONTENT } from '../data/content';
import { 
  User, 
  Settings, 
  Clock, 
  Heart, 
  Grid, 
  History as HistoryIcon,
  Activity,
  Edit2,
  Check,
  Trash2,
  Lock,
  LogOut,
  Zap,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useToast } from '../context/ToastContext';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function Profile() {
  const { currentUser, userProfile, watchlistIds, logout } = useAuth();
  const { history, topGenres } = useIntelligence();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [username, setUsername] = useState(userProfile?.name || currentUser?.displayName || 'Lumora Citizen');

  useEffect(() => {
    if (userProfile?.name) setUsername(userProfile.name);
  }, [userProfile]);

  const handleSaveName = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { name: username });
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, { displayName: username });
      }
      setIsEditingName(false);
      showToast('Neural identity synchronized', 'success');
    } catch (error) {
      showToast('Synchronization failed', 'error');
    }
  };

  const handleRemoveHistory = async (id: string) => {
    if (!currentUser) return;
    try {
       // Note: we'd need the actual doc ID, assuming it's the content ID for simplicity in this mock-history-to-real-history transition
       const historyRef = doc(db, 'users', currentUser.uid, 'history', id);
       await deleteDoc(historyRef);
       showToast('Memory fragment erased', 'info');
    } catch (err) {
       showToast('Erasure failed', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Neural link disconnected', 'info');
    } catch (err) {
      showToast('Disconnection failed', 'error');
    }
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diff < 60) return 'seconds ago';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-accent-cyan" />
          </div>
          <h1 className="text-3xl font-black text-white">Quantum Link Required</h1>
          <p className="text-white/40 max-w-xs mx-auto">Please identify your neural pattern to access your LUMORA profile.</p>
          <Link to="/login" className="inline-block bg-accent-cyan text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Identify Now
          </Link>
        </div>
      </div>
    );
  }

  const membershipDate = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Since 2024';

  const historyDisplay = history.map(h => {
    const content = MOCK_CONTENT.find(c => c.id === h.contentId);
    return content ? { ...content, ...h } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-bg-theme pb-24">
      {/* Hero Header */}
      <div className="relative h-[45vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-theme via-bg-theme/40 to-transparent z-10" />
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover opacity-30 grayscale"
            alt="Profile Background"
          />
        </div>
        
        <div className="absolute bottom-0 inset-x-0 z-20 px-6 md:px-12 pb-12 transition-all">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] bg-gradient-to-br from-accent-purple to-accent-cyan p-[2px] shadow-[0_0_50px_rgba(157,0,255,0.3)]">
                <div className="w-full h-full rounded-[38px] bg-[#0c0c0f] flex items-center justify-center overflow-hidden">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter">
                      {username.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <Settings className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-3 mb-2">
              <div className="flex items-center gap-4">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/5 border border-accent-cyan px-6 py-3 rounded-2xl text-4xl font-black text-white outline-none w-80 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="p-3.5 bg-accent-cyan text-black rounded-2xl hover:bg-white transition-colors">
                      <Check className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-4px] uppercase italic">{username}</h1>
                    <button onClick={() => setIsEditingName(true)} className="p-2.5 hover:bg-white/10 rounded-xl text-white/20 hover:text-white transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                 <p className="text-white/40 font-bold tracking-[3px] uppercase text-[10px] flex items-center gap-2.5">
                    <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                    Neural Link: Active • {membershipDate}
                 </p>
                 <div className="flex gap-2">
                    {topGenres.map(g => (
                      <span key={g} className="text-[9px] font-black uppercase tracking-widest text-accent-purple border border-accent-purple/30 px-2 py-0.5 rounded-full bg-accent-purple/5">
                        {g}
                      </span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 md:px-12 -mt-6 relative z-30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#14141c]/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl hover:border-accent-cyan/20 transition-all group">
            <Clock className="w-7 h-7 text-accent-cyan mb-5 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-white leading-none mb-1">Time Warp</p>
            <p className="text-[10px] uppercase font-bold text-white/30 tracking-[2px]">
              {Math.floor(history.length * 1.5)}h Synchronized
            </p>
          </div>
          <div className="bg-[#14141c]/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl hover:border-accent-purple/20 transition-all group">
            <Heart className="w-7 h-7 text-accent-purple mb-5 group-hover:rotate-12 transition-transform" />
            <p className="text-3xl font-black text-white leading-none mb-1">Watchlist</p>
            <p className="text-[10px] uppercase font-bold text-white/30 tracking-[2px]">
              {watchlistIds.size} Titles Archived
            </p>
          </div>
          <div className="bg-[#14141c]/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl hover:border-yellow-500/20 transition-all group">
             <Star className="w-7 h-7 text-yellow-500 mb-5 group-hover:scale-110 transition-transform" />
             <p className="text-3xl font-black text-white leading-none mb-1">Top Vibe</p>
             <p className="text-[10px] uppercase font-bold text-white/30 tracking-[2px]">
               {topGenres[0] || 'Unknown'} Master
             </p>
          </div>
          <div className="bg-[#14141c]/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl hover:border-green-500/20 transition-all group">
            <Zap className="w-7 h-7 text-green-500 mb-5 group-hover:animate-bounce" />
            <p className="text-3xl font-black text-white leading-none mb-1">Neural Rank</p>
            <p className="text-[10px] uppercase font-bold text-white/30 tracking-[2px]">
              Class S Voyager
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-20">
          {/* Recent History */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-white flex items-center gap-4">
                <HistoryIcon className="w-8 h-8 text-accent-cyan" />
                Memory Continuum
              </h2>
              <span className="text-[11px] font-black uppercase tracking-[3px] text-white/20">Last 20 Fragments</span>
            </div>

            {historyDisplay.length === 0 ? (
               <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] text-center">
                  <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">The continuum is currently blank</p>
                  <Link to="/" className="inline-block mt-4 text-accent-cyan text-xs font-black uppercase border-b border-accent-cyan/40 pb-1">Start your journey</Link>
               </div>
            ) : (
              <div className="space-y-5">
                {historyDisplay.map((item: any) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group relative flex gap-6 p-5 bg-[#14141c]/20 border border-white/5 rounded-[28px] hover:bg-[#14141c]/40 transition-all items-center overflow-hidden"
                  >
                    <div className="w-32 aspect-video rounded-2xl overflow-hidden flex-none relative shadow-2xl">
                      <img src={item.backdropUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                         <div className="h-full bg-accent-cyan shadow-[0_0_10px_var(--color-accent-cyan)]" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-lg font-black text-white truncate uppercase italic">{item.title}</h3>
                         <span className="text-[9px] font-black uppercase tracking-tighter text-white/20 px-1.5 py-0.5 border border-white/10 rounded">
                           {item.duration}
                         </span>
                      </div>
                      <p className="text-white/40 text-[10px] uppercase font-black tracking-[3px]">{timeAgo(item.lastWatchedAt)} • {item.progress}% Consumed</p>
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                       <Link 
                        to={`/watch/${item.id}`}
                        className="p-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl transition-all"
                       >
                         <Zap className="w-5 h-5 fill-current" />
                       </Link>
                       <button 
                        onClick={() => handleRemoveHistory(item.id)}
                        className="p-3 bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-xl transition-all"
                       >
                        <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Account & Settings */}
          <div className="space-y-12">
             <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[4px]">Neural Controls</h3>
                <div className="bg-[#14141c]/40 border border-white/5 rounded-[40px] p-2 overflow-hidden shadow-2xl">
                   <button className="w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between group rounded-[32px]">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent-cyan/10 rounded-xl flex items-center justify-center text-accent-cyan">
                           <Grid className="w-5 h-5" />
                        </div>
                        <span className="font-black text-white uppercase tracking-tighter text-lg">Visual Filters</span>
                     </div>
                     <span className="text-white/10 group-hover:text-white transition-colors">→</span>
                   </button>
                   <button className="w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between group rounded-[32px]">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent-purple/10 rounded-xl flex items-center justify-center text-accent-purple">
                           <Activity className="w-5 h-5" />
                        </div>
                        <span className="font-black text-white uppercase tracking-tighter text-lg">Sync Depth</span>
                     </div>
                     <span className="text-white/10 group-hover:text-white transition-colors">→</span>
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between group rounded-[32px]"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 group-hover:bg-white/10 rounded-xl flex items-center justify-center text-white/60 group-hover:text-white transition-all">
                           <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-black text-white/80 group-hover:text-white uppercase tracking-tighter text-lg transition-colors">Disconnect Link</span>
                     </div>
                   </button>
                   <button className="w-full p-6 text-left hover:bg-red-500 group rounded-[32px] transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-500/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center text-red-500 group-hover:text-white">
                               <Lock className="w-5 h-5" />
                            </div>
                            <span className="font-black text-white uppercase tracking-tighter text-lg group-hover:text-white italic">Sever Link</span>
                         </div>
                         <Trash2 className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                      </div>
                   </button>
                </div>
             </div>

             <div className="p-10 bg-gradient-to-br from-accent-purple/30 via-[#14141c] to-transparent border border-accent-purple/20 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                <h3 className="text-2xl font-black text-white leading-tight uppercase italic mb-2 tracking-tighter">TITANIUM NEXUS</h3>
                <p className="text-[10px] text-white/50 leading-relaxed font-black uppercase tracking-widest mb-8">Full Quantum Channel Access Valid Until 2025</p>
                <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[3px] text-[10px] hover:scale-105 transition-transform active:scale-95">Manage Link</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
