# Panduan Trial Fetch — Setup Cloudflare Pages + Worker & Fitur

Panduan lengkap cara men-deploy **Trial Fetch** (web) di Cloudflare dan mengaktifkan
semua fitur.

## 1. Deploy Worker

1. Push repo ini ke GitHub, lalu di Cloudflare:
   **Workers & Pages → Create → Workers → Import a repository**.
2. Pada setup build:
   - **Root directory**: `worker`
   - **Worker name**: `trial-fetch-worker` (harus sama dengan `name` di `worker/wrangler.toml`).
3. Setelah deploy, **Settings → Variables and Secrets**:
   - Tidak wajib menambah apa pun. Nilai default Baozimh sudah ditulis langsung di
     `worker/trial-fetch-worker.js` (`BAOZI_DEFAULTS`).
   - Bisa override kredensial Baozimh lewat env `BAOZI_APP_ID`, `BAOZI_DEVICE_CODE`,
     `BAOZI_DEVICE_ID`, `BAOZI_USER_AGENT`, `BAOZI_APP_VERSION` (Settings → Variables and Secrets).

> Worker ini **tidak punya URL publik**: `workers_dev = false`, `preview_urls = false`.
> Hanya bisa dipanggil lewat Service Binding dari Pages Functions.

## 2. Deploy Pages

1. **Workers & Pages → Create → Pages → Connect to Git** → pilih repo ini.
2. Build settings:
   - **Root directory**: *(kosong — jangan diisi!)*
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `frontend`
3. Deploy. Cloudflare mendeteksi `functions/` di root repo; kalau menu Functions kosong atau
   `/proxy` membalas HTML, jalankan **Retry deployment** lalu pastikan struktur folder benar.

## 3. Pasang Service Binding

1. Pages → **Settings → Bindings → Add → Service binding**.
2. Variable name: `TRIAL_FETCH_WORKER`.
3. Service: `trial-fetch-worker`.
4. Deploy ulang Pages (Deployments → Retry deployment) supaya binding aktif.

## 4. Verifikasi

- Buka `https://<project>.pages.dev/`.
- Buka `https://<project>.pages.dev/proxy?url=<encoded url>` — seharusnya JSON hasil fetch
  chapter.
- Buka `https://<project>.pages.dev/proxy?action=search&source=baozimh&q=<kata>` — hasil pencarian.

## 5. Fitur & Konfigurasi

### 5.1 Sumber pencarian

Endpoint: `/proxy?action=search&source={source}&q={query}`.

Sumber yang aktif: `baozimh`, `wmanhua`, `jjabtoon`, `koudaimh`, `jjaptoon`, `goodtoon`,
`rumanhua`. Manwang sengaja tidak disediakan.

### 5.2 Crop banner (OpenCV)

Banner atas/bawah 200px via OpenCV (100% lokal browser) — opsi di panel download.

### 5.3 Rate limit & anti open proxy

- Rate limit: 500 request/IP per 5 menit (in-memory di Worker).
- Host yang diizinkan: lihat `ALLOWED_HOST_SUFFIXES` di `worker/trial-fetch-worker.js`.

## 6. Troubleshooting

- **`/proxy` membalas HTML** → Pages Functions belum aktif. Pastikan `functions/` di root repo
  dan Build output directory = `frontend`. Retry deployment.
- **Service binding belum aktif** → deploy ulang Pages setelah binding dibuat.
- **Error dari Worker** → baca `detail` di JSON error response.
- **Baozimh 403/429** → update kredensial lewat env `BAOZI_*` atau tunggu rate limit bersih.
