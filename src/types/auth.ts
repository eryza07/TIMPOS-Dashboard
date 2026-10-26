export type UserRole = 'kader' | 'bidan' | 'admin';

export interface PosyanduProfile {
  id: string;
  userId: string;
  posyanduName: string;
  kaderName: string;
  rtRw: string;
  desaKelurahan: string;
  puskesmasPembina: string;
  mqttTopicData?: string;
  mqttTopicCommand?: string;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile?: PosyanduProfile;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
