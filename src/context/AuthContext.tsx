import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  watchlistIds: Set<string>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addToWatchlist: (contentId: string) => Promise<void>;
  removeFromWatchlist: (contentId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Fetch or create user profile
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'Cinema Explorer',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setUserProfile(newProfile);
          }

          // Fetch Watchlist efficiently
          const watchlistSnap = await getDocs(collection(db, 'users', user.uid, 'watchlist'));
          const ids = new Set(watchlistSnap.docs.map(doc => doc.id));
          setWatchlistIds(ids);

        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setUserProfile(null);
        setWatchlistIds(new Set());
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const addToWatchlist = async (contentId: string) => {
    if (!currentUser) return;
    
    // Optimistic Update
    setWatchlistIds(prev => new Set(prev).add(contentId));
    
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'watchlist', contentId);
      await setDoc(docRef, { 
        contentId, 
        addedAt: new Date().toISOString() 
      });
    } catch (error) {
      // Revert optimistic update on failure
      setWatchlistIds(prev => {
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/watchlist/${contentId}`);
    }
  };

  const removeFromWatchlist = async (contentId: string) => {
    if (!currentUser) return;
    
    // Optimistic Update
    setWatchlistIds(prev => {
      const next = new Set(prev);
      next.delete(contentId);
      return next;
    });
    
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'watchlist', contentId);
      await deleteDoc(docRef);
    } catch (error) {
      // Revert optimistic update on failure
      setWatchlistIds(prev => new Set(prev).add(contentId));
      handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.uid}/watchlist/${contentId}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      watchlistIds,
      loginWithGoogle, 
      loginWithEmail, 
      registerWithEmail, 
      logout, 
      addToWatchlist,
      removeFromWatchlist,
      resetPassword
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
