from django.db import migrations, models


def recalculate_existing_rankings(apps, schema_editor):
    """Hitung ulang peringkat semua data lama sesuai aturan baru (rank
    berdasarkan total kasus terbanyak), supaya data lama & baru konsisten."""
    PenyakitTerbanyak = apps.get_model("puskesmas", "PenyakitTerbanyak")

    groups = (
        PenyakitTerbanyak.objects.values("puskesmas_id", "tahun", "bulan")
        .distinct()
    )
    for group in groups:
        qs = PenyakitTerbanyak.objects.filter(
            puskesmas_id=group["puskesmas_id"], tahun=group["tahun"], bulan=group["bulan"]
        ).order_by("-kasus_l", "-kasus_p", "icd10")
        ids_in_order = list(qs.values_list("id", flat=True))

        for offset, obj_id in enumerate(ids_in_order, start=1):
            PenyakitTerbanyak.objects.filter(id=obj_id).update(peringkat=10_000 + offset)
        for rank, obj_id in enumerate(ids_in_order, start=1):
            PenyakitTerbanyak.objects.filter(id=obj_id).update(peringkat=rank)


def noop_reverse(apps, schema_editor):
    # Tidak ada cara bermakna untuk "mengembalikan" ranking manual lama --
    # data historisnya sudah tergantikan. Reverse ini sengaja dikosongkan.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("puskesmas", "0003_update_kecamatan"),
    ]

    operations = [
        # peringkat sekarang dihitung otomatis oleh aplikasi (lihat
        # PenyakitTerbanyak.recalculate_rankings di models.py), bukan input
        # manual -- jadi constraint unik lama (yang mengasumsikan orang
        # mengetik ranking sendiri tanpa tabrakan) tidak relevan lagi, dan
        # justru bisa mengganggu proses hitung ulang (butuh update sementara
        # lewat nilai yang di luar rentang 1-15).
        migrations.AlterUniqueTogether(
            name="penyakitterbanyak",
            unique_together=set(),
        ),
        migrations.AlterField(
            model_name="penyakitterbanyak",
            name="peringkat",
            field=models.PositiveSmallIntegerField(default=0, editable=False),
        ),
        migrations.AlterModelOptions(
            name="penyakitterbanyak",
            options={
                "ordering": ["tahun", "bulan", "-kasus_l", "-kasus_p"],
                "verbose_name": "Laporan 15 Besar Penyakit",
                "verbose_name_plural": "Laporan 15 Besar Penyakit",
            },
        ),
        migrations.RunPython(recalculate_existing_rankings, noop_reverse),
    ]
