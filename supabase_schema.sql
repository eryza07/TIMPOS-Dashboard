-- ==============================================================================
-- SKEMA DATABASE TIMPOS POSYANDU (SUPABASE POSTGRESQL + RLS SECURITY)
-- Jalankan skrip SQL ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. TABEL PROFIL POSYANDU & KADER
CREATE TABLE IF NOT EXISTS public.posyandu_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    posyandu_name TEXT NOT NULL,
    kader_name TEXT NOT NULL,
    rt_rw TEXT NOT NULL DEFAULT 'RT 01 / RW 01',
    desa_kelurahan TEXT NOT NULL DEFAULT 'Desa Sejahtera',
    puskesmas_pembina TEXT NOT NULL DEFAULT 'Puskesmas Kecamatan',
    mqtt_topic_data TEXT,
    mqtt_topic_command TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL WARGA (BALITA & IBU HAMIL)
CREATE TABLE IF NOT EXISTS public.residents (
    id TEXT PRIMARY KEY,
    posyandu_id UUID REFERENCES public.posyandu_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('BALITA', 'IBU_HAMIL')),
    age_value NUMERIC(5,2) NOT NULL,
    guardian_name TEXT NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    last_measured_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. TABEL RIWAYAT PENGUKURAN (TB, BB, STATUS KEMENKES)
CREATE TABLE IF NOT EXISTS public.measurements (
    id TEXT PRIMARY KEY,
    resident_id TEXT REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_label TEXT NOT NULL,
    age_value NUMERIC(5,2) NOT NULL,
    age_label TEXT NOT NULL,
    tb_cm NUMERIC(5,2) NOT NULL,
    bb_kg NUMERIC(5,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('NORMAL', 'WASPADA', 'BAHAYA')),
    status_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index performa pencarian warga
CREATE INDEX IF NOT EXISTS idx_residents_posyandu ON public.residents(posyandu_id);
CREATE INDEX IF NOT EXISTS idx_measurements_resident ON public.measurements(resident_id);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS)
-- Memastikan Posyandu A TIDAK BISA melihat atau mengubah data Posyandu B
-- ==============================================================================

ALTER TABLE public.posyandu_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Kebijakan posyandu_profiles: User hanya bisa akses profilnya sendiri
CREATE POLICY "Users can view and edit own posyandu profile"
ON public.posyandu_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Kebijakan residents: Hanya pemilik posyandu yang bisa akses warganya
CREATE POLICY "Posyandu can manage own residents"
ON public.residents FOR ALL
USING (
    posyandu_id IN (
        SELECT id FROM public.posyandu_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    posyandu_id IN (
        SELECT id FROM public.posyandu_profiles WHERE user_id = auth.uid()
    )
);

-- Kebijakan measurements: Hanya pemilik posyandu yang bisa akses data ukur warganya
CREATE POLICY "Posyandu can manage measurements of own residents"
ON public.measurements FOR ALL
USING (
    resident_id IN (
        SELECT r.id FROM public.residents r
        JOIN public.posyandu_profiles p ON r.posyandu_id = p.id
        WHERE p.user_id = auth.uid()
    )
)
WITH CHECK (
    resident_id IN (
        SELECT r.id FROM public.residents r
        JOIN public.posyandu_profiles p ON r.posyandu_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- ==============================================================================

-- PANDUAN MENAMBAHKAN AKUN KADER OLEH ADMINISTRATOR
-- Karena pendaftaran mandiri (public register) ditutup demi keamanan:
-- 
-- 1. Buka Supabase Dashboard -> Authentication -> Users -> Klik "Add user" -> "Create user"
-- 2. Masukkan Email & Password yang Anda siapkan untuk Kader tersebut (contoh: kader.melati@posyandu.id)
-- 3. Salin User UID yang baru dibuat, lalu jalankan query di bawah ini di SQL Editor
--    untuk memberikan nama Posyandu dan wilayahnya:
--
--    INSERT INTO public.posyandu_profiles (
--        user_id,
--        posyandu_name,
--        kader_name,
--        rt_rw,
--        desa_kelurahan,
--        puskesmas_pembina,
--        mqtt_topic_data,
--        mqtt_topic_command
--    ) VALUES (
--        'PASTE-USER-UID-DISINI',
--        'Posyandu Melati 01',
--        'Ibu Siti Aminah',
--        'RT 02 / RW 05',
--        'Desa Sukamaju',
--        'Puskesmas Sukamaju',
--        'sic8/timpos/data',
--        'sic8/timpos/command'
--    );
-- ==============================================================================

