# Backend - Si Lapor Fasyankes (Django)

Backend Django + DRF + PostgreSQL, menggantikan Express (server.ts) dari repo aslinya.
Fitur AI analysis (Gemini) sengaja **tidak** dimigrasikan.

## Struktur

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/            # settings, urls, wsgi
└── apps/
    ├── puskesmas/      # model referensi Puskesmas (FK)
    └── kunjungan/      # TEMPLATE: model, serializer, view, import/export Excel
        └── services/
            ├── importer.py   # import Excel via pandas, validasi per baris
            └── exporter.py   # export Excel via pandas/openpyxl
```

App lain (`gigi`, `penyakit`, `laboratorium`, `rujukan`) belum dibuat — tinggal
duplikasi struktur `apps/kunjungan/` (model, serializer, view, urls, services)
sesuai field masing-masing di `src/types.ts` React, lalu daftarkan di
`config/settings.py` (`INSTALLED_APPS`) dan `config/urls.py`.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# lalu edit .env: isi DB_NAME, DB_USER, DB_PASSWORD sesuai PostgreSQL lokal kamu

# buat database dulu di postgres, misalnya:
# createdb si_lapor_fasyankes

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Endpoint yang tersedia

| Method | Endpoint | Keterangan |
|---|---|---|
| GET/POST | `/api/puskesmas/` | CRUD puskesmas |
| GET/PUT/DELETE | `/api/puskesmas/<id>/` | detail |
| GET/POST | `/api/kunjungan/` | CRUD data kunjungan |
| POST | `/api/kunjungan/import/` | upload file Excel (`multipart/form-data`, field `file`) |
| GET | `/api/kunjungan/export/` | download Excel (support filter `?puskesmas=&bulan=&tahun=`) |
| POST | `/api/auth/token/` | login, dapat access & refresh token (JWT) |
| POST | `/api/auth/token/refresh/` | refresh token |

Semua endpoint (kecuali auth) butuh header `Authorization: Bearer <access_token>`.

## Menyambungkan ke frontend React

Di frontend, ganti pemanggilan `server.ts` (Express) dengan base URL Django, contoh:

```ts
const API_BASE = "http://localhost:8000/api";
```

Pastikan origin dev server React (`http://localhost:5173`) sudah ada di
`CORS_ALLOWED_ORIGINS` pada `.env`.

## Catatan penyimpanan data lama

Data yang sebelumnya cuma tersimpan di `useState` React (App.tsx) sekarang
persisten di PostgreSQL lewat model `KunjunganRecord` (dan model-model
serupa yang akan kamu buat). Constraint `unique_together (puskesmas, bulan,
tahun)` mencegah duplikat data per periode.
