# PRD KHUSUS WEB DASHBOARD "TIMPOS" (MQTT 2 ARAH + PLOTLY + VERCEL READY)
## Spesifikasi Produk & Master Prompt Eksekusi untuk AI Agent (AntiGravity)

**Informasi Dokumen**
* **Nama Produk:** TIMPOS Web Dashboard (Timbangan & Pengukur Tinggi Posyandu Digital 2-in-1)
* **Lingkup Dokumen:** Khusus Frontend Web Dashboard (100% Client-Side, Terintegrasi MQTT 2 Arah dengan Wokwi ESP32, Siap Deploy ke Vercel)
* **Target Deployment:** Vercel (`https://timpos-posyandu.vercel.app` atau sejenisnya)
* **Arsitektur Sistem:** `ESP32 Wokwi (TCP Port 1883) <---> Broker HiveMQ <---> Web Dashboard Vercel (WSS Port 8884)`
* **Penyimpanan Data Prototipe:** `localStorage` Browser (dengan 5 Data Warga Awal + Fitur Tambah & Search Warga, tanpa database eksternal dulu)
* **Status Fitur AI:** Ditampilkan sebagai **UI Mockup / Placeholder ("Segera Hadir")** di halaman Dashboard (belum disambungkan ke API AI agar ringan dan bebas error API Key)

---

## 1. Gambaran Umum & Tujuan Dashboard

Dashboard **TIMPOS** adalah aplikasi web untuk Ibu Kader Posyandu yang berfungsi sebagai pusat kendali dan layar pencatatan untuk alat ukur fisik IoT (ESP32 di Wokwi). Karena layar LCD 16x2 pada alat fisik IoT hanya menampilkan **Tinggi Badan (`TB`), Berat Badan (`BB`), dan Kategori (`BALITA` / `IBU HAMIL`)**, maka seluruh proses pemilihan warga, pengisian umur, perhitungan status gizi (**NORMAL / WASPADA / BAHAYA**), dan grafik perkembangan bulanan dilakukan secara otomatis di dalam **Web Dashboard** ini.

### Alur Kerja Utama Kader di Dashboard (5 Langkah Simpel)
1. **Cari & Pilih Warga (`Search`):** Saat warga datang ke meja Posyandu (misalnya Balita bernama *Ananda Budi* atau Ibu Hamil bernama *Ibu Rina*), kader mengetik nama warga di kolom **Search** lalu mengklik nama warga tersebut. Pilihan ini mengunci target warga sehingga setiap data TB & BB yang dikirim dari alat IoT otomatis masuk ke profil warga yang sedang dipilih.
2. **Atur Mode & Isi Umur Pasien (Kirim Sinyal ke IoT):**
   * Kader mengklik tombol **Mode Balita** atau **Mode Ibu Hamil** di Dashboard. Saat diklik, Dashboard langsung mengirim sinyal MQTT ke ESP32 Wokwi (`sic8/timpos/command`) sehingga tulisan baris ke-2 di LCD Wokwi langsung berubah menjadi `KAT: BALITA` atau `KAT: IBU HAMIL`.
   * Kader mengisi **Umur Balita (dalam Tahun, misal `4` Tahun)** atau **Usia Kandungan Ibu Hamil (dalam Minggu, misal `28` Minggu)** di Dashboard sebagai dasar perhitungan rumus status gizi.
3. **Kunci & Terima Data Ukur dari Alat IoT:**
   * Kader bisa menekan tombol fisik hijau di Wokwi **ATAU** langsung mengklik tombol **"Kunci & Tarik Data dari Alat IoT"** di layar Dashboard.
   * Saat tombol di Dashboard diklik, Dashboard mengirim sinyal `{"cmd":"REMOTE_MEASURE"}` ke Wokwi, dan Wokwi langsung membalas dengan mengirim data `TB (cm)` dan `BB (kg)` terbaru ke topik `sic8/timpos/data`.
4. **Lihat Indikasi Status Otomatis & Grafik Perkembangan:**
   * Dashboard langsung menggabungkan `Mode + Umur + TB + BB` dan menampilkan kartu indikasi warna **NORMAL (Hijau)**, **WASPADA (Kuning)**, atau **BAHAYA / STUNTING / KEK (Merah)** tanpa memerlukan AI eksternal.
   * Kader mengklik tombol **"Simpan Hasil Ukur ke Riwayat Warga"** untuk memasukkan angka tersebut ke **Grafik Garis Perkembangan (Plotly)** dan tabel riwayat bulanan warga.
5. **Kolom Tanya AI (UI Placeholder / Tahap Pengembangan):**
   * Di bagian bawah/samping tersedia kartu **"Konsultasi Gizi & Kehamilan AI"** tempat kader bisa melihat tampilan kotak tanya AI (lengkap dengan contoh pertanyaan cepat dan badge *"Segera Hadir — Tahap Pengembangan Berikutnya"*).

---

## 2. Aturan Desain Visual Mutlak: "Clean Clinical Puskesmas" (100% Anti-AI Slop)

Agar tampilan Dashboard terlihat seperti aplikasi kesehatan resmi yang rapi, bersih, dan enak dilihat di HP maupun Laptop, AI Agent (AntiGravity) **WAJIB** mematuhi aturan desain berikut:

### 2.1 Larangan Keras (Anti-AI Slop Rules)
1. **DILARANG** memakai *Dark Mode* / latar belakang hitam atau biru gelap ala *cyberpunk*.
2. **DILARANG** memakai warna gradien neon ungu, pink, atau magenta (`from-purple-500`, `to-pink-500`, dll.).
3. **DILARANG** menaruh emoji dekoratif berlebihan seperti roket, robot, atau kilauan pada judul maupun tombol. Gunakan ikon SVG bersih (seperti `lucide-react` atau SVG inline).
4. **DILARANG** menampilkan banyak grafik yang membingungkan. Hanya boleh ada **TEPAT 1 Grafik Garis Perkembangan (Plotly)** yang memiliki tombol sakelar (*toggle*) antara **Berat Badan (kg)** dan **Tinggi Badan (cm)**.

### 2.2 Palet Warna & Tipografi Standar
| Elemen UI | Kode Warna Hex | Kelas Tailwind CSS | Keterangan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Background Halaman** | `#F8FAFC` | `bg-slate-50` | Latar belakang utama halaman agar bersih dan tidak menyilaukan mata |
| **Permukaan Kartu (Card)** | `#FFFFFF` | `bg-white border-slate-200` | Semua panel/kartu modul dengan `rounded-xl shadow-sm border` |
| **Warna Utama (Primary)** | `#0D5C46` | `bg-[#0D5C46]` / `text-[#0D5C46]` | Header atas, tombol utama, tab aktif, dan garis grafik utama |
| **Teks Utama & Angka** | `#0F172A` | `text-slate-900` | Nama warga, angka besar TB (`cm`) dan BB (`kg`) |
| **Teks Sekunder / Label** | `#475569` | `text-slate-600` | Keterangan tambahan, subjudul, satuan ukur |
| **Indikasi NORMAL** | `#DCFCE7` / `#166534` | `bg-green-100 text-green-800 border-green-400` | Kartu & badge saat status gizi/kehamilan Normal |
| **Indikasi WASPADA** | `#FEF9C3` / `#854D0E` | `bg-amber-100 text-amber-800 border-amber-400` | Kartu & badge saat status gizi/kehamilan perlu dipantau |
| **Indikasi BAHAYA** | `#FEE2E2` / `#991B1B` | `bg-red-100 text-red-800 border-red-400` | Kartu & badge saat indikasi Stunting, Gizi Buruk, atau KEK |

### 2.3 Tata Letak Responsif (Desktop 2 Kolom & HP 1 Kolom)
* **Container Utama:** `max-w-6xl mx-auto px-4 py-6`
* **Tampilan Desktop / Laptop (`lg:grid-cols-12 gap-6`):**
  * **Kolom Kiri (`lg:col-span-5`):**
    1. **Kartu 1:** Pencarian (`Search`) & Daftar Warga Terdaftar + Tombol `+ Warga Baru`.
    2. **Kartu 2:** Kontrol Alat IoT 2 Arah (Pilih Mode `BALITA` / `IBU HAMIL`, Isi `Umur`, dan Tombol `Kunci & Tarik Data dari Alat IoT`).
  * **Kolom Kanan (`lg:col-span-7`):**
    3. **Kartu 3:** Panel Hasil Pengukuran Real-Time (`Mode`, `Umur`, `TB`, `BB`) + Kotak Indikasi (`NORMAL` / `WASPADA` / `BAHAYA`) + Tombol `Simpan ke Riwayat Warga`.
    4. **Kartu 4:** Grafik Perkembangan Pasien (`Plotly.js`) + Tabel Riwayat Pemeriksaan Warga yang Dipilih.
    5. **Kartu 5:** Kolom Tanya AI / Asisten Kader Posyandu (UI Mockup / *Coming Soon*).
* **Tampilan Handphone / Mobile (`grid-cols-1 gap-4`):**
  * Seluruh kartu otomatis tersusun rapi dari atas ke bawah tanpa ada tabel atau grafik yang terpotong (*horizontal overflow* diatasi dengan `overflow-x-auto`).
  * Semua tombol interaktif memiliki tinggi minimal `44px` (`py-2.5 px-4`) agar nyaman ditekan dengan jari di layar HP.

---

## 3. Spesifikasi Koneksi MQTT 2 Arah (Tanpa Backend Tambahan)

Dashboard terhubung langsung dari browser pengguna ke broker MQTT publik menggunakan protokol **WebSocket Secure (WSS)** agar kompatibel 100% dengan protokol HTTPS di **Vercel**.

### 3.1 Parameter Koneksi Broker Default
| Parameter | Nilai pada ESP32 Wokwi (C++) | Nilai pada Web Dashboard (Browser / Vercel) |
| :--- | :--- | :--- |
| **Host Broker** | `broker.hivemq.com` | `wss://broker.hivemq.com:8884/mqtt` |
| **Port & Protokol** | Port `1883` (TCP MQTT) | Port `8884` (MQTT over WebSockets Secure / WSS) |
| **Library Client** | `PubSubClient.h` | `mqtt` (`mqtt.min.js` v5.x) |
| **Topik Terima Data (ESP32 -> Dashboard)** | Publish ke `sic8/timpos/data` | Subscribe ke `sic8/timpos/data` |
| **Topik Kirim Sinyal (Dashboard -> ESP32)** | Subscribe ke `sic8/timpos/command` | Publish ke `sic8/timpos/command` |

*(Catatan: Sediakan juga tombol **"Pengaturan MQTT"** di pojok kanan atas Header agar pengguna bisa mengganti URL Broker atau Topik jika diperlukan saat pengujian).*

### 3.2 Kontrak JSON Komunikasi 2 Arah

**A. Sinyal Perintah dari Dashboard ke ESP32 Wokwi (Topik: `sic8/timpos/command`)**
1. **Saat Kader Mengubah Mode (`BALITA` / `IBU_HAMIL`) atau Klik Sinkron Mode:**
   ```json
   {
     "cmd": "SET_MODE",
     "mode": "BALITA"
   }
   ```
   atau
   ```json
   {
     "cmd": "SET_MODE",
     "mode": "IBU_HAMIL"
   }
   ```
   *(Efek di Wokwi: ESP32 membunyikan buzzer `beep` 1x dan mengubah baris ke-2 LCD 16x2 menjadi `KAT: BALITA` atau `KAT: IBU HAMIL`).*

2. **Saat Kader Mengklik Tombol "Kunci & Tarik Data dari Alat IoT" di Dashboard:**
   ```json
   {
     "cmd": "REMOTE_MEASURE"
   }
   ```
   *(Efek di Wokwi: ESP32 langsung mengunci pembacaan sensor Ultrasonik HC-SR04 dan Load Cell HX711 saat itu juga, menampilkan `DATA TERKIRIM!` di LCD, lalu mem-publish JSON hasil ukur ke Dashboard).*

**B. Data Pengukuran dari ESP32 Wokwi ke Dashboard (Topik: `sic8/timpos/data`)**
Saat tombol fisik di Wokwi ditekan atau saat dipicu oleh `REMOTE_MEASURE` dari Dashboard, ESP32 mengirim payload JSON berikut:
```json
{
  "device_id": "TIMPOS-01",
  "mode": "BALITA",
  "tb_cm": 98.5,
  "bb_kg": 14.8
}
```
*(Efek di Dashboard: Angka `tb_cm` dan `bb_kg` langsung tampil di Kartu 3 untuk warga yang sedang dipilih, lalu Dashboard otomatis menghitung ulang status `NORMAL` / `WASPADA` / `BAHAYA` sesuai umur warga tersebut).*

---

## 4. Logika Perhitungan Indikasi Status Gizi & Kehamilan di Dashboard

Karena perhitungan tidak menggunakan AI dan tidak dilakukan di dalam ESP32, Web Dashboard wajib memiliki fungsi JavaScript mandiri untuk mengevaluasi status berdasarkan **Mode + Umur + TB + BB**:

### 4.1 Tabel Acuan Mode `BALITA` (Berdasarkan Umur dalam Tahun)
| Umur Balita | Konversi Bulan | Tinggi Normal Minimum (`TB`) | Batas Bahaya Stunting (`TB`) | Rentang Berat Normal (`BB`) | Batas Bahaya Gizi Kurang (`BB`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0.5 Tahun** | 6 Bulan | $\ge 63.0\text{ cm}$ | $< 61.0\text{ cm}$ | $6.4 - 9.2\text{ kg}$ | $< 5.7\text{ kg}$ |
| **1 Tahun** | 12 Bulan | $\ge 71.0\text{ cm}$ | $< 68.5\text{ cm}$ | $7.7 - 11.5\text{ kg}$ | $< 6.9\text{ kg}$ |
| **1.5 Tahun** | 18 Bulan | $\ge 76.5\text{ cm}$ | $< 74.0\text{ cm}$ | $8.8 - 13.0\text{ kg}$ | $< 7.8\text{ kg}$ |
| **2 Tahun** | 24 Bulan | $\ge 81.0\text{ cm}$ | $< 78.0\text{ cm}$ | $9.7 - 14.5\text{ kg}$ | $< 8.6\text{ kg}$ |
| **3 Tahun** | 36 Bulan | $\ge 88.5\text{ cm}$ | $< 85.0\text{ cm}$ | $11.3 - 16.8\text{ kg}$ | $< 10.0\text{ kg}$ |
| **4 Tahun** | 48 Bulan | $\ge 95.0\text{ cm}$ | $< 91.0\text{ cm}$ | $12.7 - 18.5\text{ kg}$ | $< 11.2\text{ kg}$ |
| **5 Tahun** | 60 Bulan | $\ge 101.0\text{ cm}$ | $< 96.5\text{ cm}$ | $14.1 - 21.0\text{ kg}$ | $< 12.4\text{ kg}$ |

* **Aturan Keputusan Mode `BALITA`:**
  * **BAHAYA (Merah):** Jika `TB < Batas Bahaya TB` (Indikasi Stunting) ATAU `BB < Batas Bahaya BB` (Gizi Buruk/Kurang).
  * **WASPADA (Kuning):** Jika `TB < Tinggi Normal Minimum` ATAU `BB < Berat Normal Minimum` ATAU `BB > Berat Normal Maksimum` (Risiko Gizi Lebih).
  * **NORMAL (Hijau):** Jika `TB` dan `BB` berada di dalam rentang normal sesuai umurnya.

### 4.2 Tabel Acuan Mode `IBU_HAMIL` (Berdasarkan Usia Kandungan dalam Minggu)
| Trimester | Usia Kandungan | Tinggi Minimal Aman (`TB`) | Rentang Berat Ideal (`BB`) | Batas Bahaya KEK (`BB` / `IMT`) |
| :--- | :--- | :--- | :--- | :--- |
| **Trimester 1** | $1 - 12\text{ Minggu}$ | $\ge 145.0\text{ cm}$ | $45.0 - 72.0\text{ kg}$ | $\text{BB} < 42.0\text{ kg}$ atau $\text{IMT} < 18.5$ |
| **Trimester 2** | $13 - 27\text{ Minggu}$ | $\ge 145.0\text{ cm}$ | $47.0 - 76.0\text{ kg}$ | $\text{BB} < 44.0\text{ kg}$ atau $\text{IMT} < 18.5$ |
| **Trimester 3** | $28 - 42\text{ Minggu}$ | $\ge 145.0\text{ cm}$ | $50.0 - 80.0\text{ kg}$ | $\text{BB} < 46.0\text{ kg}$ atau $\text{IMT} < 18.5$ |

* **Aturan Keputusan Mode `IBU_HAMIL`:**
  * **BAHAYA (Merah):** Jika `TB < 145.0 cm` (Risiko Panggul Sempit/Kehamilan Berisiko) ATAU `BB < Batas Bahaya KEK` ATAU `IMT < 18.5` (Risiko Kurang Energi Kronis / KEK).
  * **WASPADA (Kuning):** Jika `BB > Berat Ideal Maksimum` ATAU `IMT > 28.5` (Waspada Obesitas Kehamilan / Pantau Tekanan Darah Pre-eklampsia).
  * **NORMAL (Hijau):** Jika `TB >= 145.0 cm` dan `BB` berada dalam rentang ideal sesuai minggu kehamilan.

---

## 5. Spesifikasi Detail Setiap Komponen UI di Dashboard

### 5.1 Header Atas (Sticky Top Bar)
* **Bagian Kiri:** Badge inisial **"TP"** + Judul **"TIMPOS — Dashboard Posyandu Digital"** + Subjudul *"Integrasi Alat Ukur IoT 2 Arah (Balita & Ibu Hamil)"*.
* **Bagian Kanan:**
  1. **Badge Status Koneksi MQTT:** Menampilkan titik lampu indikator (`Hijau Berkedip` saat terhubung ke `broker.hivemq.com:8884`, atau `Kuning` saat mode simulasi/menunggu jaringan).
  2. **Tombol `Pengaturan MQTT`:** Membuka modal untuk melihat/mengubah URL WebSocket Broker (`wss://broker.hivemq.com:8884/mqtt`), Topik Data (`sic8/timpos/data`), dan Topik Perintah (`sic8/timpos/command`).

### 5.2 Kartu 1: Cari & Pilih Warga Terdaftar (`Search` + Filter + Tambah Warga)
* **Fungsi Utama:** Menentukan warga mana yang sedang naik ke alat timbangan/ukur IoT. Saat kader mengklik salah satu warga di daftar ini, seluruh panel di sebelah kanan (Mode, Umur, Hasil Ukur, dan Grafik Perkembangan) otomatis berganti menampilkan data warga tersebut.
* **Elemen di dalam Kartu 1:**
  1. **Input Search Real-Time:** Kotak pencarian (`Cari nama balita, ibu hamil, nama wali, atau ID...`) lengkap dengan tombol `X` untuk menghapus teks pencarian.
  2. **Tab Filter Kategori:** 3 tombol tab (`Semua`, `Balita`, `Ibu Hamil`) lengkap dengan angka jumlah warganya.
  3. **Tombol `+ Warga Baru`:** Membuka modal pendaftaran warga singkat (Nama, Kategori `BALITA`/`IBU_HAMIL`, Umur Tahun/Minggu, Nama Wali/Suami, TB Awal, BB Awal).
  4. **List Warga Scrollable:** Menampilkan daftar warga dengan informasi Nama, ID (`BLT-01`, `BML-01`), Kategori & Umur, TB/BB terakhir, serta badge status terakhir (`NORMAL` / `WASPADA` / `BAHAYA`). Warga yang sedang dipilih memiliki *highlight* garis tepi hijau `#0D5C46`.

### 5.3 Kartu 2: Kontrol Alat IoT 2 Arah & Pengaturan Umur Pasien
* **Banner Pasien Aktif:** Menampilkan dengan jelas siapa warga yang sedang dipilih saat ini (Contoh: *"Sedang Diperiksa: Ananda Budi Santoso (BLT-01)"*) agar kader tidak salah memasukkan data.
* **Tombol Sakelar Mode Pemeriksaan (Kirim Sinyal ke LCD Wokwi):**
  * 2 tombol besar berdampingan: **`MODE BALITA`** dan **`MODE IBU HAMIL`**.
  * Saat diklik, otomatis mengirim JSON `{"cmd":"SET_MODE","mode":"BALITA"}` atau `{"cmd":"SET_MODE","mode":"IBU_HAMIL"}` ke Wokwi.
* **Input Umur Pasien & Tombol Pilihan Cepat (*Quick Chips*):**
  * Jika Mode `BALITA`: Input angka **Umur (Tahun)** dengan pilihan tombol cepat `1 Thn`, `2 Thn`, `3 Thn`, `4 Thn`, `5 Thn`.
  * Jika Mode `IBU_HAMIL`: Input angka **Usia Kandungan (Minggu)** dengan pilihan tombol cepat `12 Mgg`, `20 Mgg`, `24 Mgg`, `28 Mgg`, `36 Mgg`.
* **Tombol Aksi Utama ke IoT (`Kunci & Tarik Data dari Alat IoT`):**
  * Tombol menonjol berwarna biru/hijau tua yang saat diklik mengirim perintah `{"cmd":"REMOTE_MEASURE"}` ke topik `sic8/timpos/command`, memicu ESP32 di Wokwi untuk langsung mengunci dan mengirimkan angka TB & BB ke Dashboard.
* **Kotak Info Standar Acuan Kemenkes:** Menampilkan batas TB Normal dan BB Normal sesuai angka umur yang sedang diisi kader.

### 5.4 Kartu 3: Hasil Pengukuran IoT & Kartu Indikasi Status
* **4 Kotak Metrik Utama:**
  1. **Kategori / Mode:** `BALITA` atau `IBU HAMIL` (+ keterangan sumber data).
  2. **Umur Pasien:** Contoh `4 Tahun (48 Bulan)` atau `28 Minggu (Trimester 3)`.
  3. **Tinggi Badan (TB):** Angka besar `XX.X cm` + selisih (`+X.X cm`) dibandingkan pengukuran bulan lalu.
  4. **Berat Badan (BB):** Angka besar `XX.X kg` + selisih (`+X.X kg`) dan nilai `IMT`.
* **Kartu Indikasi Status (`NORMAL` / `WASPADA` / `BAHAYA`):**
  * Berubah warna secara otomatis (Hijau / Kuning / Merah) lengkap dengan penjelasan medis singkat yang mudah dibacakan oleh kader kepada orang tua balita atau ibu hamil.
* **Baris Simulasi Tes Cepat & Simpan Data:**
  * Sediakan 3 tombol kecil (`Simulasi Normal`, `Simulasi Waspada`, `Simulasi Bahaya`) + input koreksi manual untuk memudahkan demonstrasi video jika sewaktu-waktu Wokwi sedang ditutup.
  * Tombol utama **`Simpan Hasil Ukur ke Grafik Pasien`**: Menambahkan data TB, BB, Umur, dan Status hari ini ke dalam riwayat warga yang dipilih, menyimpannya ke `localStorage`, dan langsung memperbarui Grafik Perkembangan di Kartu 4.

### 5.5 Kartu 4: Grafik Perkembangan Pasien (Plotly) & Tabel Riwayat
* **1 Grafik Garis Interaktif (`Plotly.js`):**
  * Menampilkan kurva pertumbuhan pasien dari bulan ke bulan berdasarkan warga yang sedang dipilih di Kartu 1.
  * Memiliki 2 tombol sakelar di kanan atas grafik: **`Berat Badan (kg)`** dan **`Tinggi Badan (cm)`**.
  * Menampilkan **3 garis perbandingan**:
    1. Garis Hijau Tebal (`#0D5C46`): Data aktual warga dari bulan ke bulan.
    2. Garis Hijau Putus-Putus (`#16A34A`): Batas Normal Minimum Kemenkes sesuai umur.
    3. Garis Merah Titik-Titik (`#DC2626`): Batas Bahaya Stunting / KEK.
* **Tabel Riwayat Pemeriksaan Warga:** Tabel rapi di bawah grafik yang memuat daftar riwayat `Periode`, `Umur`, `Tinggi (TB)`, `Berat (BB)`, dan badge `Indikasi Status`.

### 5.6 Kartu 5: Kolom Tanya AI / Konsultasi Gizi Kader (UI Mockup — *Belum Berfungsi*)
* **Tujuan:** Sesuai permintaan pengembangan bertahap, kolom ini tetap ditampilkan secara rapi di dalam Dashboard untuk memperlihatkan rancangan fitur masa depan tanpa membebani sistem dengan integrasi API Key Gemini saat ini.
* **Elemen di dalam Kartu 5:**
  1. **Judul Kartu:** *"Asisten Konsultasi Gizi & Kehamilan AI"* dilengkapi badge berwarna abu-abu/amber **`Segera Hadir (Tahap Pengembangan)`**.
  2. **Pilihan Pertanyaan Contoh (Chips):** Contoh: *"Menu PMT untuk balita kurang berat badan"*, *"Saran nutrisi ibu hamil Trimester 3"*.
  3. **Kolom Input Pertanyaan & Tombol `Tanya AI`:** Kotak input teks tempat kader bisa mengetik pertanyaan. Saat tombol **`Tanya AI`** diklik, tampilkan kotak pesan informatif yang sopan di bawahnya:
     > *"Fitur Konsultasi AI (Integrasi LLM) saat ini berada dalam tahap pengembangan berikutnya. Untuk saat ini, silakan gunakan hasil Indikasi Otomatis Kemenkes (Normal / Waspada / Bahaya) pada panel di atas sebagai acuan utama pemeriksaan Posyandu."*

---

## 6. MASTER PROMPT SIAP COPY-PASTE KE AI AGENT (ANTIGRAVITY)

> **Cara Pakai:** Salin (*copy*) seluruh blok di bawah ini dan tempelkan (*paste*) langsung ke **AntiGravity** untuk membangun proyek yang siap di-deploy ke **Vercel**.

```markdown
# ROLE & TASK
Kamu adalah Senior Frontend & IoT Web Engineer. Tugasmu adalah membangun aplikasi Web Dashboard bernama **"TIMPOS" (Timbangan & Pengukur Tinggi Posyandu Digital 2-in-1 untuk Balita & Ibu Hamil)** yang terintegrasi 2 arah dengan simulator ESP32 Wokwi melalui protokol MQTT over WebSockets, menggunakan grafik interaktif **Plotly.js**, dan **100% siap di-deploy ke VERCEL tanpa error build**.

Jangan gunakan placeholder `// TODO` atau memotong kode. Tulis seluruh kode aplikasi secara lengkap, rapi, dan siap pakai.

---

# 1. ATURAN VISUAL & UI/UX: "CLEAN CLINICAL PUSKESMAS" (ANTI-AI SLOP)
1. **DILARANG KERAS:**
   - Jangan gunakan Dark Mode atau background gelap.
   - Jangan gunakan gradien ungu, pink, atau warna neon mencolok.
   - Jangan gunakan emoji dekoratif berlebihan (🚀, 🤖, ✨). Gunakan ikon SVG bersih (`lucide-react` atau inline SVG).
   - Jangan membuat lebih dari 1 grafik! Hanya boleh ada **1 Grafik Garis Perkembangan (Plotly)** dengan tombol switch antara `Berat Badan (kg)` dan `Tinggi Badan (cm)`.
2. **PALET WARNA WAJIB:**
   - Background Halaman: `#F8FAFC` (`bg-slate-50`)
   - Kartu/Panel: `#FFFFFF` (`bg-white border border-slate-200 rounded-xl shadow-sm`)
   - Warna Utama Puskesmas: Hijau Emerald Tua `#0D5C46` (`bg-[#0D5C46]`, hover `bg-emerald-900`)
   - Warna Indikasi Status:
     * **NORMAL:** `bg-green-100 border-green-400 text-green-900` (Badge: `bg-green-800 text-white`)
     * **WASPADA:** `bg-amber-100 border-amber-400 text-amber-900` (Badge: `bg-amber-700 text-white`)
     * **BAHAYA:** `bg-red-100 border-red-400 text-red-900` (Badge: `bg-red-800 text-white`)
3. **RESPONSIVITAS SEMUA DEVICE (HP & DESKTOP):**
   - Gunakan layout `max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6`.
   - Di Desktop: Kolom Kiri (`lg:col-span-5`) berisi Kartu 1 (Search Warga) & Kartu 2 (Kontrol IoT 2 Arah + Input Umur). Kolom Kanan (`lg:col-span-7`) berisi Kartu 3 (Hasil Ukur & Indikasi), Kartu 4 (Grafik Plotly & Tabel Riwayat), dan Kartu 5 (Kolom Tanya AI Mockup).
   - Di HP/Mobile: Tersusun 1 kolom vertikal yang rapi, semua tombol memiliki tinggi minimal 44px agar nyaman disentuh jari, dan grafik Plotly otomatis menyesuaikan lebar layar (`responsive: true`).

---

# 2. SPESIFIKASI INTEGRASI MQTT 2 ARAH (ESP32 WOKWI <-> DASHBOARD VERCEL)
Tanpa menggunakan backend server tambahan, hubungkan langsung browser ke broker MQTT menggunakan library `mqtt` (WebSocket Secure / WSS):
- **Default Broker URL (Browser WSS):** `wss://broker.hivemq.com:8884/mqtt` (Kompatibel dengan ESP32 Wokwi yang terhubung ke `broker.hivemq.com` TCP port `1883`).
- **Topik Subscribe (Terima Data dari ESP32 Wokwi):** `sic8/timpos/data`
  Format JSON yang diterima dari Wokwi:
  `{"device_id":"TIMPOS-01","mode":"BALITA","tb_cm":98.5,"bb_kg":14.8}`
  Saat pesan masuk, otomatis perbarui angka TB (`cm`), BB (`kg`), dan Mode pada warga yang sedang dipilih, lalu hitung ulang Indikasi Status (`NORMAL` / `WASPADA` / `BAHAYA`).
- **Topik Publish (Kirim Sinyal Perintah dari Dashboard ke ESP32 Wokwi):** `sic8/timpos/command`
  1. Saat kader klik tombol ganti mode (`MODE BALITA` atau `MODE IBU HAMIL`) atau klik tombol `Sinkron ke Alat IoT`, kirim JSON:
     `{"cmd":"SET_MODE","mode":"BALITA"}` atau `{"cmd":"SET_MODE","mode":"IBU_HAMIL"}`
  2. Saat kader klik tombol **"Kunci & Kirim Data dari Alat IoT"** di Dashboard, kirim JSON:
     `{"cmd":"REMOTE_MEASURE"}`
- Sediakan juga Modal **"Pengaturan MQTT"** di Header atas agar user bisa mengganti Broker URL dan nama topik jika diperlukan.

---

# 3. FITUR WAJIB DI DALAM DASHBOARD (5 KARTU UTAMA)

### KARTU 1: Cari & Pilih Warga Terdaftar (`Search` + Filter + Tambah Warga Baru)
- Sediakan **5 Data Warga Awal** di `localStorage` (3 Balita dan 2 Ibu Hamil, masing-masing sudah memiliki 4 riwayat pemeriksaan bulanan agar grafik langsung terisi bagus saat pertama dibuka).
- Fitur **Search Real-Time** berdasarkan Nama Warga, ID (`BLT-01`, `BML-01`), atau Nama Ibu/Wali.
- Filter tab kategori: `Semua`, `Balita`, `Ibu Hamil`.
- Saat salah satu warga di daftar diklik:
  1. Tandai warga tersebut sebagai **Pasien Sedang Diperiksa** (data yang masuk dari IoT akan masuk ke warga ini).
  2. Otomatis sesuaikan Mode (`BALITA` / `IBU_HAMIL`), Umur, angka TB/BB terakhir, Grafik Perkembangan Plotly, dan Tabel Riwayat dengan profil warga tersebut.
- Tombol **`+ Warga Baru`** membuka modal form untuk menambah warga baru ke `localStorage`.

### KARTU 2: Kontrol Alat IoT 2 Arah (Mode, Umur, & Tombol Kunci Data)
- Menampilkan kotak info **Warga yang Sedang Diperiksa** (Nama, ID, Wali, TB & BB pemeriksaan terakhir).
- **Sakelar Mode Pemeriksaan:** Tombol `MODE BALITA` dan `MODE IBU HAMIL` (mengirim sinyal MQTT ke LCD Wokwi).
- **Input Umur Pasien:**
  - Jika `BALITA`: Input angka **Umur (Tahun)** (0.5 s/d 5 tahun) + tombol cepat (`1 Tahun`, `2 Tahun`, `3 Tahun`, `4 Tahun`, `5 Tahun`).
  - Jika `IBU_HAMIL`: Input angka **Usia Kandungan (Minggu)** (4 s/d 42 minggu) + tombol cepat (`12 Minggu`, `20 Minggu`, `24 Minggu`, `28 Minggu`, `36 Minggu`).
- **Tombol Utama Kontrol Jarak Jauh:**
  - Tombol **`Kunci & Tarik Data dari Alat IoT`** (mengirim `{"cmd":"REMOTE_MEASURE"}` ke Wokwi).
  - Tombol **`Sinkronkan Mode ke LCD Alat`** (mengirim `{"cmd":"SET_MODE","mode":"..."}` ke Wokwi).
- **Kotak Acuan Standar Kemenkes:** Menampilkan batas TB & BB Normal serta batas Bahaya sesuai umur yang sedang dipilih.

### KARTU 3: Hasil Pengukuran IoT & Indikasi Otomatis (NORMAL / WASPADA / BAHAYA)
- Menampilkan 4 kotak ringkasan: **Mode Aktif**, **Umur Pasien**, **Tinggi Badan (`cm` + selisih bulan lalu)**, dan **Berat Badan (`kg` + IMT)**.
- **Kotak Indikasi Status Otomatis:**
  Menghitung status secara instan berdasarkan **Mode + Umur + TB + BB** menggunakan tabel standar Kemenkes RI:
  - **`NORMAL` (Hijau):** Pertumbuhan balita atau kondisi fisik ibu hamil sesuai standar usia.
  - **`WASPADA` (Kuning):** Berat/tinggi sedikit di bawah standar atau berat berlebih (risiko obesitas / pantau pre-eklampsia).
  - **`BAHAYA` (Merah):** Indikasi Stunting / Gizi Kurang pada Balita, atau Risiko KEK (Kurang Energi Kronis) / Tinggi < 145 cm pada Ibu Hamil.
- Sediakan 3 tombol **Simulasi Cepat** (`Simulasi Normal`, `Simulasi Waspada`, `Simulasi Bahaya`) untuk pengetesan instan di layar, serta tombol utama **`Simpan Hasil Ukur ke Riwayat Warga`** yang langsung memperbarui grafik Plotly dan tabel riwayat warga aktif.

### KARTU 4: Grafik Perkembangan Pasien (Plotly.js) & Tabel Riwayat
- Render 1 grafik garis interaktif menggunakan `Plotly.js` yang menampilkan riwayat pertumbuhan warga yang sedang dipilih.
- Sediakan tombol switch metrik: **`Berat Badan (kg)`** dan **`Tinggi Badan (cm)`**.
- Grafik menampilkan 3 garis:
  1. Garis Hijau Utama (`#0D5C46`): Riwayat pertumbuhan warga.
  2. Garis Hijau Putus-putus (`#16A34A`): Standar Normal Minimum sesuai umur.
  3. Garis Merah Titik-titik (`#DC2626`): Batas Bahaya (Stunting / KEK).
- Di bawah grafik, tampilkan **Tabel Riwayat Pemeriksaan** milik warga tersebut (`Periode`, `Umur`, `TB`, `BB`, `Status`).

### KARTU 5: Kolom Tanya AI / Asisten Gizi Posyandu (UI Mockup — Belum Aktif)
- Buat kartu UI yang rapi di bawah Grafik dengan judul **"Tanya AI — Asisten Konsultasi Gizi & Kehamilan"** dan badge **`Segera Hadir / Tahap Pengembangan`**.
- Sediakan beberapa chip contoh pertanyaan (misal: *"Rekomendasi PMT Balita 4 Tahun"*, *"Tips Gizi Ibu Hamil Trimester 3"*), sebuah kotak input teks (`textarea` / `input`), dan tombol **`Tanya AI`**.
- **Penting:** Fitur ini **BELUM dihubungkan ke API AI mana pun**. Jika user mengetik pertanyaan dan menekan tombol `Tanya AI`, tampilkan kotak respons statis yang rapi dan informatif bahwa modul AI sedang dalam tahap pengembangan selanjutnya, sehingga aplikasi bebas dari ketergantungan API Key dan 100% siap dideploy ke Vercel sekarang juga.

---

# 4. KESIAPAN DEPLOYMENT VERCEL
- Pastikan seluruh library browser (`mqtt` dan `plotly.js`) dimuat secara aman di sisi client (*client-side only* / menghindari error `window is not defined` saat proses `next build` atau Vite/static build di Vercel).
- Pastikan aplikasi dapat langsung di-build dan di-deploy ke **Vercel** tanpa memerlukan konfigurasi `.env` wajib apa pun.
```
