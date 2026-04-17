import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useKeyboardNav() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DON'T run keyboard navigation if we're on a watch page (it has its own player shortcuts)
      if (location.pathname.startsWith('/watch/')) return;

      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          // Logic for Search overlay is handled by UIContext, 
          // but we can navigate to search page too
          navigate('/search');
          break;
        case 'h':
          navigate('/');
          break;
        case 'm':
          navigate('/movies');
          break;
        case 's':
          navigate('/series');
          break;
        case 'w':
          navigate('/watchlist');
          break;
        case 'p':
          navigate('/profile');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.pathname]);
}
