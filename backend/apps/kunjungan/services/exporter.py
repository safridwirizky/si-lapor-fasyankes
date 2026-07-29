import pandas as pd
from io import BytesIO
from ..models import KunjunganRecord


def export_kunjungan_excel(queryset=None) -> BytesIO:
    qs = queryset if queryset is not None else KunjunganRecord.objects.select_related("puskesmas").all()

    data = [
        {
            "puskesmas": r.puskesmas.nama,
            "bulan": r.bulan,
            "tahun": r.tahun,
            "jumlah_kunjungan_baru": r.jumlah_kunjungan_baru,
            "jumlah_kunjungan_lama": r.jumlah_kunjungan_lama,
            "jumlah_kunjungan_bpjs": r.jumlah_kunjungan_bpjs,
            "jumlah_kunjungan_umum": r.jumlah_kunjungan_umum,
        }
        for r in qs
    ]
    df = pd.DataFrame(data)

    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Kunjungan")
    buffer.seek(0)
    return buffer
