# LinkHub

LinkHub adalah platform manajemen tautan (link-in-bio) modern dan estetis yang memungkinkan pengguna membuat profil personal untuk menampilkan berbagai tautan, media sosial, dan konten embed dalam satu halaman.

Dibangun dengan performa dan pengalaman pengguna sebagai prioritas, LinkHub menggunakan teknologi web terbaru seperti Next.js 15+, Prisma, dan Tailwind CSS.

## ✨ Fitur Utama

* **🔐 Autentikasi Aman:** Login mudah menggunakan akun Google (NextAuth.js).
* **🎨 Kustomisasi Profil:** Ubah username, bio, foto profil, dan pilih tema warna (Default, Midnight Black, Ocean Blue, Sunset Gradient).
* **🔗 Manajemen Tautan:**
    * Tambah, edit, dan hapus tautan tanpa batas.
    * **Auto Metadata Scraping:** Mengambil judul, deskripsi, dan gambar thumbnail otomatis dari URL.
    * **Drag & Drop:** Atur ulang urutan tautan dengan mudah menggunakan antarmuka drag-and-drop.
    * **Tipe Tautan:** Mendukung tautan Klasik, Ikon Sosial, dan Embed (YouTube/Spotify).
* **Ck Analitik Mendalam:**
    * Pantau jumlah klik total dan harian.
    * Informasi perangkat (Device), peramban (Browser), dan sistem operasi (OS).
    * Lokasi geografis pengunjung (Negara & Kota).
    * Sumber lalu lintas (Referrer).
* **🖼️ Dynamic OG Image:** Pembuatan gambar Open Graph otomatis untuk setiap profil pengguna agar terlihat menarik saat dibagikan di media sosial.
* **⚡ Rate Limiting:** Perlindungan API menggunakan Upstash Redis untuk mencegah penyalahgunaan.
* **📱 Responsif:** Tampilan yang optimal di perangkat desktop maupun seluler.

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI) & Lucide Icons
* **Autentikasi:** [NextAuth.js](https://next-auth.js.org/)
* **State Management & Drag-n-Drop:** `@dnd-kit`
* **Charting:** [Recharts](https://recharts.org/)
* **Caching & Rate Limiting:** [Upstash Redis](https://upstash.com/)
* **Metadata Fetching:** `open-graph-scraper`
* **OG Image Generation:** `satori` & `resvg`

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

* [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru)
* [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
* Database PostgreSQL (Lokal atau Cloud seperti Supabase/Neon)
* Akun Google Cloud Console (untuk OAuth)
* Akun Upstash (untuk Redis Rate Limiting)

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

linkhub/ ├── prisma/ # Schema database & migrasi │ └── schema.prisma ├── public/ # Aset statis (gambar, icon) ├── src/ │ ├── app/ # Next.js App Router │ │ ├── (auth)/ # Halaman login │ │ ├── api/ # API Routes (Analytics, Auth, Link, OG, Scrape) │ │ ├── dashboard/ # Halaman admin pengguna (Links, Settings, Analytics) │ │ └── u/[username]/ # Halaman profil publik pengguna │ ├── components/ # Komponen UI (Buttons, Inputs, Cards, Sidebar) │ ├── hooks/ # Custom React Hooks (useLinks) │ ├── lib/ # Utilitas (Auth config, Prisma client, Theme config) │ └── types/ # Definisi tipe TypeScript ├── .env # Environment variables (Git ignored) ├── middleware.ts # Middleware Next.js └── package.json

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

Dibuat dengan ❤️ menggunakan Next.js dan Prisma.