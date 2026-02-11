# Panduan Penggunaan GTunnel dengan Format Sauce Connect

> **⚠️ Pengguna Windows**: Selalu gunakan `gtunnel start`, BUKAN hanya `start`. Lihat [troubleshooting Windows](#windows-the-system-cannot-find-the-file--u) jika ada error.

## Pertanyaan Pengguna

Sauce Labs menyarankan command:
```bash
sc run -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

Bagaimana cara menggunakan command yang sama dengan gtunnel?

## Jawaban: Command GTunnel yang Kompatibel

GTunnel sekarang **100% kompatibel** dengan format command Sauce Connect. Anda cukup mengganti `sc run` dengan `gtunnel start`:

```bash
gtunnel start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

## Penjelasan Parameter

| Parameter | Keterangan | Contoh Nilai |
|-----------|------------|--------------|
| `-u` atau `--user` | Username Sauce Labs | `oauth-wfuller894-22ca3` |
| `-k` | Access key Sauce Labs | `a19e5030-ec22-4eb4-a5d9-29ca7c15e6db` |
| `--region` | Region data center | `us-west`, `eu-central`, `us-east` |
| `--tunnel-name` | Nama tunnel | `oauth-wfuller894-22ca3_tunnel_name` |

## Output yang Dihasilkan

Ketika Anda menjalankan command di atas, GTunnel akan menampilkan:

```
✓ GTunnel started successfully!

  Server:    http://0.0.0.0:8080
  Dashboard: http://localhost:8081
  Metrics:   http://localhost:9090/metrics

  Sauce Labs Mode: Enabled
  Username:  oauth-wfuller894-22ca3
  Tunnel:    oauth-wfuller894-22ca3_tunnel_name
  Region:    us-west

Press Ctrl+C to stop
```

## Contoh Penggunaan Lainnya

### 1. Command Minimal
```bash
gtunnel start -u myusername -k myaccesskey --tunnel-name my-tunnel
```

### 2. Dengan Region Spesifik
```bash
gtunnel start -u myusername -k myaccesskey --region eu-central --tunnel-name my-tunnel
```

### 3. Menggunakan Environment Variables
Anda juga bisa menggunakan environment variables:

```bash
export SAUCE_USERNAME=oauth-wfuller894-22ca3
export SAUCE_ACCESS_KEY=a19e5030-ec22-4eb4-a5d9-29ca7c15e6db
export SAUCE_TUNNEL_ID=oauth-wfuller894-22ca3_tunnel_name

gtunnel start
```

### 4. Kombinasi dengan Opsi GTunnel
Anda bisa menggabungkan parameter Sauce Connect dengan opsi GTunnel:

```bash
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel --port 9000 --host localhost
```

## Region yang Tersedia

- `us-west` - Amerika Barat
- `us-east` - Amerika Timur  
- `eu-central` - Eropa Tengah
- `apac` - Asia Pasifik

## Fitur Tambahan GTunnel

Selain kompatibilitas dengan Sauce Connect, GTunnel juga menyediakan:

1. **Dashboard Real-time**: http://localhost:8081
2. **Metrics Prometheus**: http://localhost:9090/metrics
3. **Health Check**: http://localhost:8080/health

## Troubleshooting (Pemecahan Masalah)

### Windows: "The system cannot find the file -u"

Jika Anda mengalami error ini di Windows:
```
The system cannot find the file -u.
```

Ini terjadi ketika Anda menggunakan command `start` Windows bawaan, bukan `gtunnel start`.

**Masalah:** Windows memiliki command bawaan `start` untuk membuka program/file. Ketika Anda mengetik `start -u ...`, Windows mencoba membuka file bernama "-u".

**Solusi:** Selalu gunakan prefix `gtunnel`:

❌ **SALAH (tanpa `gtunnel`):**
```bash
start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name my-tunnel
```

✅ **BENAR:**
```bash
gtunnel start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name my-tunnel
```

### Windows: "gtunnel is not recognized"

Jika Anda melihat error:
```
'gtunnel' is not recognized as an internal or external command
```

**Solusi:**

1. **Install global dan restart terminal:**
   ```bash
   npm install -g gtunnel
   ```
   Kemudian tutup dan buka kembali terminal Anda.

2. **Gunakan npx (tidak perlu instalasi):**
   ```bash
   npx gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
   ```

3. **Gunakan script helper** (otomatis menggunakan npx jika diperlukan):
   - `start.bat` untuk Command Prompt
   - `start.ps1` untuk PowerShell

### Windows Command Prompt vs PowerShell

**Command Prompt (cmd.exe):**
```cmd
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

**PowerShell:**
```powershell
gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

Jika `gtunnel` tidak dikenali, gunakan `npx`:
```powershell
npx gtunnel start -u myuser -k mykey --tunnel-name my-tunnel
```

## Command Lainnya

### Cek Status Tunnel
```bash
gtunnel status
```

### Stop Tunnel
```bash
gtunnel stop
```

### Lihat Konfigurasi
```bash
gtunnel config --show
```

### Lihat Help
```bash
gtunnel start --help
```

## Kesimpulan

Untuk menggunakan GTunnel dengan detail yang sama seperti Sauce Connect, Anda hanya perlu:

**Sauce Connect:**
```bash
sc run -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

**GTunnel:**
```bash
gtunnel start -u oauth-wfuller894-22ca3 -k a19e5030-ec22-4eb4-a5d9-29ca7c15e6db --region us-west --tunnel-name oauth-wfuller894-22ca3_tunnel_name
```

Tinggal ganti `sc run` menjadi `gtunnel start` - **semua parameter sama persis**!

## Dokumentasi Lengkap

Untuk dokumentasi lengkap dalam bahasa Inggris, lihat:
- [docs/SAUCE_CONNECT_COMPATIBILITY.md](SAUCE_CONNECT_COMPATIBILITY.md)
- [README.md](../README.md)
