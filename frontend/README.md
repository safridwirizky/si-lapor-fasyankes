# Frontend - SI LAPOR FASYANKES

React + TypeScript + Vite. Mengonsumsi backend Django REST Framework
(lihat `../backend/README.md`) — tidak ada server Node/Express lagi di sisi
frontend, murni SPA yang fetch ke API.

## Setup

```bash
npm install
npm run dev
```

Frontend jalan di `http://localhost:5173` (default Vite) atau `:3000`
tergantung config — pastikan URL ini terdaftar di `CORS_ALLOWED_ORIGINS`
backend Django (`backend/.env`).

Base URL API di-hardcode di `src/App.tsx` (`API_BASE_URL`). Ganti langsung
di situ kalau backend jalan di host/port lain, atau pindahkan ke env
variable (`VITE_API_BASE_URL`) kalau perlu beda antara dev & production.

## Struktur

```
src/
├── App.tsx              # state utama, fetch/POST/PATCH/DELETE ke Django
├── types.ts              # tipe data, HARUS sinkron sama serializer Django
├── components/
│   ├── Header.tsx
│   ├── NavigationTabs.tsx
│   ├── DashboardOverview.tsx
│   └── <Laporan>ReportView.tsx   # 1 komponen per laporan (Kunjungan, Gigi, dst)
└── utils/excelUtil.ts    # export ke .xlsx (client-side)
```

## Build

```bash
npm run build      # output ke dist/
npm run preview    # coba hasil build secara lokal
```
