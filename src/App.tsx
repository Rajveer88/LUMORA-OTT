import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IntelligenceProvider } from './context/IntelligenceContext';
import { ToastProvider } from './context/ToastContext';
import { UIProvider, useUI } from './context/UIContext';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import MobileHeader from './components/layout/MobileHeader';
import SearchOverlay from './components/layout/SearchOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { SkeletonPage } from './components/Skeletons';
import ToastContainer from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const Series = lazy(() => import('./pages/Series'));
const MyList = lazy(() => import('./pages/MyList'));
const Profile = lazy(() => import('./pages/Profile'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const Title = lazy(() => import('./pages/Title'));
const Search = lazy(() => import('./pages/Search'));
const Auth = lazy(() => import('./pages/Auth'));
const Trending = lazy(() => import('./pages/Trending'));

function AppRoutes() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');
  const { isSearchOpen, closeSearch } = useUI();

  return (
    <div className="flex bg-[#050507] min-h-screen selection:bg-accent-cyan selection:text-black relative overflow-x-hidden">
      {!isWatchPage && <Sidebar />}
      {!isWatchPage && <MobileHeader />}
      {!isWatchPage && <BottomNav />}
      
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
      <ToastContainer />
      
      <main 
        id="main-content"
        className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          !isWatchPage && "md:pl-20 pb-16 md:pb-0"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<SkeletonPage />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/series" element={<Series />} />
                <Route path="/watchlist" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/title/:id" element={<Title />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <UIProvider>
            <IntelligenceProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </IntelligenceProvider>
          </UIProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
