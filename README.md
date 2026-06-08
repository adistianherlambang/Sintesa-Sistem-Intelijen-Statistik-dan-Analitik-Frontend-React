# Sintesa - Sistem Intelijen Statistik dan Analitik - Frontend

## Kredensial User Dummy untuk Testing
Untuk pengujian otentikasi (Login & Signup) serta pembatasan wilayah (1 user = 1 wilayah), gunakan akun pengujian berikut:

* **Email**: `admin@bps.go.id`
* **Kata Sandi**: `password123`
* **Wilayah Tugas**: `Kota Metro` (Sudah Terklaim)

---

## Cara Menjalankan Aplikasi
1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan server dev:
   ```bash
   npm start
   ```

---

## Logika Pembatasan Wilayah
* Pilihan wilayah tugas dikelola secara dinamis.
* Wilayah yang telah diklaim oleh instansi lain (seperti `Kota Metro` yang diklaim oleh `admin@bps.go.id`) akan dinonaktifkan (`disabled`) pada dropdown pendaftaran wilayah di halaman pendaftaran (`/signup`).
