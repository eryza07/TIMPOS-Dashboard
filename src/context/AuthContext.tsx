import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthUser, PosyanduProfile, AuthStatus } from '../types/auth';

interface RegisterParams {
  email: string;
  password: string;
  posyanduName: string;
  kaderName: string;
  rtRw: string;
  desaKelurahan: string;
  puskesmasPembina: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: PosyanduProfile | null;
  authStatus: AuthStatus;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (posyanduName?: string) => void;
  register: (params: RegisterParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const LOCAL_AUTH_KEY = 'timpos_local_auth_user';
const LOCAL_PROFILE_KEY = 'timpos_local_auth_profile';

const DEMO_PROFILES: Record<string, PosyanduProfile> = {
  melati: {
    id: 'posyandu-melati-01',
    userId: 'user-melati-01',
    posyanduName: 'Posyandu Melati 01',
    kaderName: 'Ibu Siti Aminah (Kader Utama)',
    rtRw: 'RT 02 / RW 05',
    desaKelurahan: 'Desa Sukamaju',
    puskesmasPembina: 'Puskesmas Pembina Sukamaju',
    mqttTopicData: 'sic8/timpos/data',
    mqttTopicCommand: 'sic8/timpos/command',
  },
  mawar: {
    id: 'posyandu-mawar-02',
    userId: 'user-mawar-02',
    posyanduName: 'Posyandu Mawar 02',
    kaderName: 'Ibu Ratna Dewi (Bidan Desa)',
    rtRw: 'RT 04 / RW 02',
    desaKelurahan: 'Kelurahan Mekarjaya',
    puskesmasPembina: 'Puskesmas Mekarjaya',
    mqttTopicData: 'sic8/timpos/mawar/data',
    mqttTopicCommand: 'sic8/timpos/mawar/command',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<PosyanduProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  // Muat status autentikasi awal (Supabase atau Local Storage)
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            // Ambil profil Posyandu dari tabel posyandu_profiles
            const { data: profileData } = await supabase
              .from('posyandu_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            const userProfile: PosyanduProfile = profileData ? {
              id: profileData.id,
              userId: profileData.user_id,
              posyanduName: profileData.posyandu_name,
              kaderName: profileData.kader_name,
              rtRw: profileData.rt_rw,
              desaKelurahan: profileData.desa_kelurahan,
              puskesmasPembina: profileData.puskesmas_pembina,
              mqttTopicData: profileData.mqtt_topic_data || 'sic8/timpos/data',
              mqttTopicCommand: profileData.mqtt_topic_command || 'sic8/timpos/command',
            } : {
              id: session.user.id,
              userId: session.user.id,
              posyanduName: 'Posyandu Kader',
              kaderName: session.user.email?.split('@')[0] || 'Kader',
              rtRw: 'RT 01 / RW 01',
              desaKelurahan: 'Desa Sejahtera',
              puskesmasPembina: 'Puskesmas Kecamatan',
              mqttTopicData: 'sic8/timpos/data',
              mqttTopicCommand: 'sic8/timpos/command',
            };

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'kader',
              profile: userProfile,
            });
            setProfile(userProfile);
            setAuthStatus('authenticated');
            return;
          }
        } catch (err) {
          console.warn('[Auth] Gagal inisialisasi sesi Supabase, fallback ke local:', err);
        }
      }

      // Fallback ke penyimpanan lokal jika Supabase belum dikonfigurasi
      try {
        const savedUser = localStorage.getItem(LOCAL_AUTH_KEY);
        const savedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (savedUser && savedProfile && isMounted) {
          const parsedUser = JSON.parse(savedUser);
          const parsedProfile = JSON.parse(savedProfile);
          
          // Bersihkan jika masih tersisa sesi demo bawaan lama
          if (
            parsedUser?.email?.includes('posyandudigital.id') ||
            parsedProfile?.id?.includes('melati-01') ||
            parsedProfile?.id?.includes('mawar-02')
          ) {
            localStorage.removeItem(LOCAL_AUTH_KEY);
            localStorage.removeItem(LOCAL_PROFILE_KEY);
            setUser(null);
            setProfile(null);
            setAuthStatus('unauthenticated');
            return;
          }

          setUser(parsedUser);
          setProfile(parsedProfile);
          setAuthStatus('authenticated');
          return;
        }
      } catch (e) {
        console.error('Error loading local auth:', e);
      }

      if (isMounted) {
        setAuthStatus('unauthenticated');
      }
    }

    initAuth();

    // Listen Supabase Auth Changes
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          initAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setAuthStatus('unauthenticated');
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Login dengan Email & Password
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          // Profile will be picked up by onAuthStateChange / initAuth
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Gagal login ke Supabase' };
      }
    }

    // Local / Offline fallback login
    const mockProfile: PosyanduProfile = {
      id: `local-pos-${Date.now()}`,
      userId: `local-user-${Date.now()}`,
      posyanduName: email.includes('mawar') ? 'Posyandu Mawar 02' : 'Posyandu Melati 01',
      kaderName: email.split('@')[0].toUpperCase(),
      rtRw: 'RT 02 / RW 05',
      desaKelurahan: 'Desa Sukamaju',
      puskesmasPembina: 'Puskesmas Sukamaju',
      mqttTopicData: 'sic8/timpos/data',
      mqttTopicCommand: 'sic8/timpos/command',
    };

    const mockUser: AuthUser = {
      id: mockProfile.userId,
      email,
      role: 'kader',
      profile: mockProfile,
    };

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mockProfile));

    setUser(mockUser);
    setProfile(mockProfile);
    setAuthStatus('authenticated');
    return { success: true };
  }, []);

  // 2. Login Cepat Mode Demo (Untuk Uji Coba Seketika di Localhost)
  const loginAsDemo = useCallback((preset: string = 'melati') => {
    const demoProfile = DEMO_PROFILES[preset] || DEMO_PROFILES.melati;
    const demoUser: AuthUser = {
      id: demoProfile.userId,
      email: `${preset}@posyandudigital.id`,
      role: 'kader',
      profile: demoProfile,
    };

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(demoProfile));

    setUser(demoUser);
    setProfile(demoProfile);
    setAuthStatus('authenticated');
  }, []);

  // 3. Registrasi Posyandu & Akun Kader Baru
  const register = useCallback(async (params: RegisterParams): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              posyandu_name: params.posyanduName,
              kader_name: params.kaderName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Buat entri profil posyandu di tabel posyandu_profiles
          const { error: profileError } = await supabase.from('posyandu_profiles').insert({
            user_id: data.user.id,
            posyandu_name: params.posyanduName,
            kader_name: params.kaderName,
            rt_rw: params.rtRw,
            desa_kelurahan: params.desaKelurahan,
            puskesmas_pembina: params.puskesmasPembina,
            mqtt_topic_data: `posyandu/${params.posyanduName.toLowerCase().replace(/[^a-z0-9]/g, '')}/data`,
            mqtt_topic_command: `posyandu/${params.posyanduName.toLowerCase().replace(/[^a-z0-9]/g, '')}/command`,
          });

          if (profileError) {
            console.error('Error creating posyandu profile:', profileError);
          }

          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Gagal mendaftar ke Supabase' };
      }
    }

    // Local / Offline fallback registration
    const newProfile: PosyanduProfile = {
      id: `pos-${Date.now()}`,
      userId: `user-${Date.now()}`,
      posyanduName: params.posyanduName,
      kaderName: params.kaderName,
      rtRw: params.rtRw,
      desaKelurahan: params.desaKelurahan,
      puskesmasPembina: params.puskesmasPembina,
      mqttTopicData: `posyandu/${params.posyanduName.toLowerCase().replace(/[^a-z0-9]/g, '')}/data`,
      mqttTopicCommand: `posyandu/${params.posyanduName.toLowerCase().replace(/[^a-z0-9]/g, '')}/command`,
    };

    const newUser: AuthUser = {
      id: newProfile.userId,
      email: params.email,
      role: 'kader',
      profile: newProfile,
    };

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));

    setUser(newUser);
    setProfile(newProfile);
    setAuthStatus('authenticated');
    return { success: true };
  }, []);

  // 4. Logout / Keluar
  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out Supabase:', e);
      }
    }

    localStorage.removeItem(LOCAL_AUTH_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);

    setUser(null);
    setProfile(null);
    setAuthStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authStatus,
        isSupabaseConfigured,
        login,
        loginAsDemo,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
