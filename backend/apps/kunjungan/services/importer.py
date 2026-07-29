import pandas as pd
from django.db import transaction
from apps.puskesmas.models import Puskesmas
from ..models import KunjunganRecord

REQUIRED_COLUMNS = [
    "puskesmas", "bulan", "tahun",
    "jumlah_kunjungan_baru", "jumlah_kunjungan_lama",
    "jumlah_kunjungan_bpjs", "jumlah_kunjungan_umum",
]


def import_kunjungan_excel(file) -> dict:
    """
    Import file Excel kunjungan.
    Return dict berisi jumlah baris sukses & daftar error per baris
    (bukan cuma "import gagal" generik).
    """
    df = pd.read_excel(file)

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        return {
            "success": 0,
            "errors": [f"Kolom wajib tidak ditemukan: {', '.join(missing_cols)}"],
        }

    errors = []
    success = 0

    with transaction.atomic():
        for idx, row in df.iterrows():
            row_number = idx + 2  # +2: header row + 0-index
            try:
                puskesmas_nama = str(row["puskesmas"]).strip()
                puskesmas, _ = Puskesmas.objects.get_or_create(nama=puskesmas_nama)

                bulan = int(row["bulan"])
                tahun = int(row["tahun"])
                if not (1 <= bulan <= 12):
                    raise ValueError(f"bulan tidak valid: {bulan}")

                for field in [
                    "jumlah_kunjungan_baru", "jumlah_kunjungan_lama",
                    "jumlah_kunjungan_bpjs", "jumlah_kunjungan_umum",
                ]:
                    if int(row[field]) < 0:
                        raise ValueError(f"{field} tidak boleh negatif")

                KunjunganRecord.objects.update_or_create(
                    puskesmas=puskesmas, bulan=bulan, tahun=tahun,
                    defaults={
                        "jumlah_kunjungan_baru": int(row["jumlah_kunjungan_baru"]),
                        "jumlah_kunjungan_lama": int(row["jumlah_kunjungan_lama"]),
                        "jumlah_kunjungan_bpjs": int(row["jumlah_kunjungan_bpjs"]),
                        "jumlah_kunjungan_umum": int(row["jumlah_kunjungan_umum"]),
                    },
                )
                success += 1
            except Exception as e:
                errors.append(f"Baris {row_number}: {e}")

    return {"success": success, "errors": errors}
