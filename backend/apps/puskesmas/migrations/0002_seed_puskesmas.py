from django.db import migrations

PUSKESMAS_LIST = [
    "Baa", "Batutua", "Busalangga", "Delha", "Eahun", "Feapopi",
    "Korbafo", "Oelaba", "Oele", "Ndao", "Sonimanu", "Sotimori",
]


def seed_puskesmas(apps, schema_editor):
    Puskesmas = apps.get_model("puskesmas", "Puskesmas")
    for nama in PUSKESMAS_LIST:
        Puskesmas.objects.get_or_create(
            nama=nama,
            defaults={"kode": nama.upper()[:20], "aktif": True},
        )


def remove_puskesmas(apps, schema_editor):
    Puskesmas = apps.get_model("puskesmas", "Puskesmas")
    Puskesmas.objects.filter(nama__in=PUSKESMAS_LIST).delete()


class Migration(migrations.Migration):

    dependencies = [
        # GANTI ke nama file migration pertama app puskesmas kamu, misalnya:
        ("puskesmas", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_puskesmas, remove_puskesmas),
    ]
