# 🔗 Inspage

**Inspage** adalah platform *link-in-bio* open-source yang modern, estetis, dan kaya fitur. Aplikasi ini memungkinkan pengguna membuat halaman profil personal untuk menggabungkan semua tautan media sosial, portofolio, dan konten embed dalam satu tempat yang mudah dibagikan.

Dibangun dengan performa tinggi menggunakan **Next.js 16 (App Router)**, **Prisma**, dan **Tailwind CSS v4**.

![Inspage Preview](/public/logo.jpg)

## ✨ Fitur Utama

### 👤 Profil & Personalisasi
* **Custom Themes:** Pilih dari tema bawaan (Default, Dark, Ocean, Sunset) atau buat tema kustom sendiri (Warna background, font, accent color, background image).
* **SEO Friendly:** Pengaturan kustom untuk Meta Title dan Description profil.
* **QR Code:** Generate QR Code otomatis untuk kemudahan berbagi profil.

### 🔗 Manajemen Tautan Canggih
* **Tipe Tautan Beragam:**
    * **Classic:** Tautan standar dengan judul, deskripsi, dan thumbnail.
    * **Social:** Ikon media sosial di footer profil.
    * **Embed:** Putar video YouTube atau Spotify langsung di halaman (tanpa redirect).
    * **Support:** Tombol khusus untuk dukungan/donasi.
* **Auto Metadata:** Mengambil judul dan gambar thumbnail secara otomatis dari URL tujuan (Scraping).
* **Drag & Drop:** Atur ulang urutan tautan dengan mudah.
* **Keamanan & Privasi:**
    * 🔒 **Password Protection:** Kunci tautan tertentu dengan kata sandi.
    * 🔞 **Sensitive Content:** Blur tautan sensitif dengan peringatan konfirmasi sebelum dibuka.

### 📊 Analitik Mendalam
* **Statistik Real-time:** Pantau jumlah klik total dan harian.
* **Detail Pengunjung:**
    * **Perangkat:** Desktop vs Mobile.
    * **Lokasi:** Negara dan Kota pengunjung.
    * **Referrer:** Dari mana pengunjung berasal (Instagram, Twitter, Direct, dll).
* **Performa Tinggi:** Menggunakan Redis (Upstash) untuk *caching* dan *rate limiting*.

### 🛡️ Keamanan & Teknis
* **Rate Limiting:** Mencegah penyalahgunaan API.
* **Secure Auth:** Login menggunakan Google (NextAuth.js).
* **Dynamic OG Image:** Pembuatan gambar Open Graph otomatis untuk setiap profil pengguna.

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Auth:** [NextAuth.js v4](https://next-auth.js.org/)
* **UI Libraries:** [Shadcn UI](https://ui.shadcn.com/), Lucide React, Framer Motion
* **Drag & Drop:** `@dnd-kit`
* **Charting:** [Recharts](https://recharts.org/)
* **Cache & Rate Limit:** [Upstash Redis](https://upstash.com/)
* **Image Storage:** [Cloudinary](https://cloudinary.com/)

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menyiapkan:

1.  **Node.js** (Versi 18.17 atau lebih baru).
2.  **PostgreSQL Database** (Lokal atau Cloud seperti Neon/Supabase).
3.  **Akun Google Cloud Platform** (Untuk OAuth Client ID & Secret).
4.  **Akun Upstash** (Untuk Redis database).
5.  **Akun Cloudinary** (Untuk upload gambar).

## 🚀 Panduan Instalasi

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/username/linkhub.git](https://github.com/username/linkhub.git)
    cd linkhub
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment Variables:**
    Buat file `.env` di root direktori proyek dan isi dengan variabel berikut:

    ```env
    # Database (PostgreSQL)
    DATABASE_URL="postgresql://user:password@localhost:5432/linkhub?schema=public"

    # NextAuth (Google OAuth)
    GOOGLE_CLIENT_ID="id_klien_google_anda"
    GOOGLE_CLIENT_SECRET="rahasia_klien_google_anda"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="rahasia_acak_untuk_enkripsi_session"

    # Upstash Redis (untuk Rate Limiting)
    UPSTASH_REDIS_REST_URL="[https://url-redis-anda.upstash.io](https://url-redis-anda.upstash.io)"
    UPSTASH_REDIS_REST_TOKEN="token-redis-anda"
    ```

4.  **Setup Database:**
    Jalankan migrasi Prisma untuk membuat tabel di database Anda.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Jalankan Server Development:**
    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📂 Struktur Proyek

Berikut adalah gambaran umum struktur folder proyek:
linkhub/
├── prisma/               # Schema database & migrasi
├── public/               # Aset statis (logo, icon)
├── src/
│   ├── app/              # Next.js App Router (Pages & API)
│   │   ├── (auth)/       # Halaman Login
│   │   ├── api/          # Endpoints (Auth, Link, Analytics, OG, Cron)
│   │   ├── dashboard/    # Halaman Admin Pengguna
│   │   └── u/[username]/ # Halaman Profil Publik
│   ├── components/       # Komponen UI (Atomic & Fragments)
│   ├── hooks/            # Custom React Hooks
│   ├── lib/              # Utilitas (Prisma, Auth, Redis, Theme, Cloudinary)
│   └── types/            # Definisi Tipe TypeScript
├── .env                  # Environment Variables
├── next.config.ts        # Konfigurasi Next.js
└── tailwind.config.ts    # Konfigurasi Tailwind (v4 via CSS)


## 💡 Contoh Penggunaan

### 1. Membuat Akun & Login
Kunjungi halaman utama dan klik **"Login dengan Google"**. Setelah berhasil masuk, username unik akan dibuat secara otomatis (bisa diubah nanti).

### 2. Menambah Link
1.  Masuk ke **Dashboard**.
2.  Klik tombol **"+ Tambah Link"**.
3.  Masukkan URL tujuan. Anda bisa menekan tombol **"Ambil Metadata"** untuk mengisi judul dan gambar secara otomatis dari website tujuan.
4.  Pilih tipe konten: **Tautan**, **Sosial** (ikon kecil), atau **Embed**.
5.  Simpan.

### 3. Mengatur Tampilan
Pergi ke menu **Settings** di dashboard untuk:
* Mengubah foto profil.
* Mengganti nama dan username.
* Menulis bio singkat.
* Memilih tema warna (contoh: Ocean Blue atau Sunset Gradient).

### 4. Melihat Analitik
Klik ikon **Grafik/Bar Chart** pada salah satu kartu link di dashboard untuk melihat detail statistik pengunjung link tersebut.

## 🤝 Kontribusi

Kontribusi sangat diterima! Jika Anda ingin meningkatkan proyek ini:

1.  Fork repositori ini.
2.  Buat branch fitur baru (`git checkout -b fitur-keren`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4.  Push ke branch (`git push origin fitur-keren`).
5.  Buat Pull Request.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

Dibuat dengan ❤️ oleh Kudeng.


