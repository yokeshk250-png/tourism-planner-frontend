import { create } from 'zustand';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      });
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
}));

export default useAuthStore;
