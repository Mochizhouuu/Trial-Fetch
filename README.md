# Trial Fetch — Cloudflare Pages + Worker (Service Binding)

Aplikasi web **Trial Fetch**: unduh chapter komik dari berbagai source (Baozimh, Wmanhua,
Jjabtoon (situs mati, hanya paste URL), Koudaimh, Jjaptoon, Goodtoon, dst.) lewat Cloudflare Worker proxy, yang mana
frontend-nya di-deploy di **Cloudflare Pages** dan Worker-nya dihubungkan lewat
**Service Binding** — pola yang sama seperti OCR Studio.

```
trial-fetch/
├── functions/                 → Pages Functions (HARUS di root repo!)
│   └── [[path]].js            (meneruskan /proxy ke Worker via binding TRIAL_FETCH_WORKER)
├── frontend/                  → situs statis Cloudflare Pages
│   ├── index.html             (single-file frontend)
│   ├── _routes.json           (Function hanya jalan untuk /proxy)
│   ├── _headers               (CSP & keamanan header)
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── assets/
│   ├── banners/
│   └── opencv/                (fallback lokal OpenCV untuk crop banner)
└── worker/                    → Cloudflare Worker (tanpa URL publik)
    ├── trial-fetch-worker.js (proxy komik: /proxy?url=..., ?action=search, ?action=rumanhua-img)
    └── wrangler.toml
```

> Panduan deploy & setup fitur ada di **[GUIDE.md](GUIDE.md)**.

## Fitur utama

- **Ambil chapter**: tempel URL chapter → daftar chapter → unduh gambar (ZIP via JSZip + FileSaver) → simpan ke device.
- **Cari Judul**: pencarian multi-source lewat Worker (`?action=search`).
- **Crop banner**: potong banner atas/bawah 200px otomatis (OpenCV, 100% lokal browser) untuk source Baozimh & OpenCV-based.
- **Riwayat unduh** tersimpan di browser (localStorage).

## Langkah deploy (semua bisa dari HP lewat dashboard)

1. Push folder ini ke satu repo GitHub.
2. **Deploy Worker dulu.** Workers & Pages → Create → Workers → Import a repository.
   - Root directory: `worker`
   - Nama Worker harus sama dengan `name` di `worker/wrangler.toml` (`trial-fetch-worker`).
   - Setelah deploy: Settings → Variables and Secrets → isi `BAOZI_*` **opsional**
     (kalau kredensial Baozimh di worker lama berubah; tanpa ini, default bawaan worker
     dipakai — lihat `BAOZI_DEFAULTS` di `worker/trial-fetch-worker.js`).
3. **Deploy Pages.** Workers & Pages → Create → Pages → Connect to Git.
   - Root directory: **kosong** (jangan diisi!)
   - Build command: kosongkan. Build output directory: `frontend`
   - Cloudflare otomatis mendeteksi folder `functions/` di root repo; kalau Function
     tidak aktif, jalankan Retry deployment lalu cek menu Functions (harusnya tidak kosong).
4. **Pasang Service Binding.** Pages → Settings → Bindings → Add → Service binding
   - Variable name: `TRIAL_FETCH_WORKER`
   - Service: `trial-fetch-worker`
   - Lalu deploy ulang Pages (Deployments → Retry deployment) agar binding aktif.
5. Buka domain `*.pages.dev`.

## Catatan

- Frontend memanggil `/proxy` (path relatif) lewat Pages Function → Service Binding Worker.
  Tidak ada URL Worker langsung. `_routes.json` membatasi Function hanya untuk `/proxy`.
- Worker memakai `workers_dev = false`, `preview_urls = false` — tidak bisa dipanggil langsung
  dari luar, hanya lewat Service Binding.
- **Dark mode**: ikut sistem + tombol tema di header (localStorage `tf-theme`).
- **Rate limit**: 500 request/IP/5 menit (in-memory di Worker).
- **Anti open proxy**: Worker hanya menerima host dari allowlist platform komik
  (lihat `ALLOWED_HOST_SUFFIXES` di `worker/trial-fetch-worker.js`).
- **Sumber pencarian aktif**: Baozimh, Wmanhua, Koudaimh, Jjaptoon, Goodtoon, Rumanhua. Jjabtoon & Manwang diblokir origin (Jjabtoon mati sejak Nov 2026, Manwang 403 permanen) — tetap bisa dipakai lewat "paste URL" di tab Ambil selama domain masih hidup.
  (endpoint `?action=search`). Manwang sengaja tidak disediakan (diblokir origin).
- **Baozimh**: header app (`app-id`, `device-code`, dll) dari `BAOZI_DEFAULTS` di worker
  (bisa dioverride lewat env `BAOZI_*`).
- Situs Pages sendiri tetap publik. Siapa pun yang membuka situsmu bisa memakai proxy.
  Untuk membatasi, aktifkan Cloudflare Access atau tambahkan Rate Limiting di dashboard.
