# Backend - SI LAPOR FASYANKES (Django)

Backend Django REST Framework + PostgreSQL untuk Dinas Kesehatan Kabupaten
Rote Ndao. Menggantikan backend Express (`server.ts`) dari repo React asli.
Fitur analisis AI (Gemini) sengaja **tidak** dimigrasikan.

## Struktur

Semua model laporan ditaruh dalam **satu app** `apps/puskesmas`, bukan
app terpisah per laporan — lebih simpel untuk skala project ini (5 laporan,
semuanya berelasi ke master data Puskesmas yang sama).

```
backend/
├── manage.py
├── requirements.txt
├── .env.example        # salin jadi .env, isi sesuai lokal kamu
├── config/              # settings, urls, wsgi
├── data/                # file Excel resmi (referensi struktur kolom)
└── apps/
    └── puskesmas/
        ├── models.py       # Puskesmas + 5 model laporan (semua FK ke Puskesmas)
        ├── serializers.py  # jembatan camelCase (React) <-> snake_case (Django)
        ├── views.py        # ModelViewSet per laporan (CRUD otomatis + filter)
        ├── urls.py         # DefaultRouter, daftar semua endpoint
        ├── admin.py
        └── migrations/
```

### Model laporan yang tersedia

| Model | Endpoint | Field unik per laporan |
|---|---|---|
| `KunjunganPasien` | `/api/kunjungan/` | rajal, ranap, jiwa (L/P) |
| `KesehatanGigiMulut` | `/api/gigi/` | tumpatan, pencabutan, kasus gigi (+ rasio & % rujuk, computed) |
| `PenyakitTerbanyak` | `/api/penyakit/` | peringkat, ICD-10, diagnosa, kasus (L/P) |
| `PemeriksaanLaboratorium` | `/api/laboratorium/` | elemen data, jumlah (L/P) |
| `Rujukan` | `/api/rujukan/` | faskes tujuan, umum/BPJS/SKTM (L/P) |

Semua model laporan berbagi field dasar lewat abstract base class
(`puskesmas`, `tahun`, `bulan`, `created_at`, `updated_at`).

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: isi SECRET_KEY, DB_*, CORS_ALLOWED_ORIGINS sesuai lokal kamu

python manage.py migrate
python manage.py createsuperuser   # opsional, buat akses /admin/
python manage.py runserver
```

API akan jalan di `http://127.0.0.1:8000/api/`. Browsable API DRF bisa
dibuka langsung lewat browser di path yang sama (mis.
`http://127.0.0.1:8000/api/kunjungan/`).

## Endpoint per laporan

Semua endpoint laporan (`kunjungan`, `gigi`, `penyakit`, `laboratorium`,
`rujukan`) mendukung operasi standar DRF `ModelViewSet`:

- `GET /api/<laporan>/` — list (dipaging, 50/halaman)
- `POST /api/<laporan>/` — buat baru
- `GET /api/<laporan>/{id}/` — detail satu record
- `PATCH /api/<laporan>/{id}/` — update sebagian field
- `DELETE /api/<laporan>/{id}/` — hapus

Filter lewat query param, contoh:
```
GET /api/kunjungan/?bulan=Januari&tahun=2026&puskesmas__nama=Baa
```

## Yang belum ada (rencana ke depan)

- **Import Excel server-side** — `requirements.txt` sudah menyiapkan
  `pandas` + `openpyxl` untuk ini, tapi endpoint importer-nya belum dibuat.
  File Excel resmi di `data/` bisa dipakai sebagai acuan struktur kolom
  saat membuatnya.
- **Export Excel server-side** — saat ini export masih dilakukan di
  frontend (client-side, dari data yang sudah di-fetch). Bisa dipindah ke
  backend kalau butuh format yang lebih presisi/konsisten dengan file resmi.
- **Autentikasi** — endpoint saat ini `AllowAny` (belum ada login/permission
  per Puskesmas). Perlu ditambahkan sebelum dipakai di luar lingkungan
  development/testing.
