import { create } from 'zustand';
import {
  registerUser, loginUser, logoutUser, getUserProfile,
  updateUserProfile, onAuthChange, resetPassword,
} from '../services/firebase';

interface AuthState {
  user:         any | null;
  profile:      any | null;
  loading:      boolean;
  error:        string | null;
  initialized:  boolean;
  // actions
  register:     (email: string, password: string, name: string) => Promise<void>;
  login:        (email: string, password: string) => Promise<void>;
  logout:       () => Promise<void>;
  forgotPassword:(email: string) => Promise<void>;
  loadProfile:  () => Promise<void>;
  updateProfile:(data: any) => Promise<void>;
  clearError:   () => void;
  init:         () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  profile:     null,
  loading:     false,
  error:       null,
  initialized: false,

  init: () => {
    onAuthChange(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid).catch(() => null);
        set({ user, profile, initialized: true });
      } else {
        set({ user: null, profile: null, initialized: true });
      }
    });
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const user    = await registerUser(email, password, name);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user    = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ loading: true });
    await logoutUser();
    set({ user: null, profile: null, loading: false });
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await resetPassword(email);
      set({ loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    set({ profile });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    set({ loading: true });
    await updateUserProfile(user.uid, data);
    await get().loadProfile();
    set({ loading: false });
  },

  clearError: () => set({ error: null }),
}));
