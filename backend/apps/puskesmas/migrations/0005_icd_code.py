import csv
from pathlib import Path

from django.db import migrations, models


SEED_CSV_PATH = Path(__file__).resolve().parent / "seed_data" / "icd10.csv"


def seed_icd10(apps, schema_editor):
    IcdCode = apps.get_model("puskesmas", "IcdCode")

    if not SEED_CSV_PATH.exists():
        # Jangan gagalkan migrate kalau file CSV-nya hilang -- cukup skip,
        # supaya deploy tidak macet total gara-gara satu file data hilang.
        # Tabel akan tetap ada, cuma kosong (bisa diisi ulang manual nanti).
        return

    batch = []
    BATCH_SIZE = 2000

    with open(SEED_CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = (row.get("code") or "").strip()
            display = (row.get("display") or "").strip()
            if not code:
                continue
            batch.append(IcdCode(code=code, display=display))
            if len(batch) >= BATCH_SIZE:
                IcdCode.objects.bulk_create(batch, ignore_conflicts=True)
                batch = []

    if batch:
        IcdCode.objects.bulk_create(batch, ignore_conflicts=True)


def remove_icd10(apps, schema_editor):
    IcdCode = apps.get_model("puskesmas", "IcdCode")
    IcdCode.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("puskesmas", "0004_peringkat_otomatis"),
    ]

    operations = [
        migrations.CreateModel(
            name="IcdCode",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(db_index=True, max_length=10, unique=True)),
                ("display", models.CharField(max_length=500)),
            ],
            options={
                "verbose_name": "Kode ICD-10",
                "verbose_name_plural": "Kode ICD-10",
                "ordering": ["code"],
            },
        ),
        migrations.RunPython(seed_icd10, remove_icd10),
    ]
