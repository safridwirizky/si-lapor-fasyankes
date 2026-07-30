from django.db import migrations

KECAMATAN_MAP = {
    "Baa": "Lobalain",
    "Batutua": "Rote Barat Daya",
    "Busalangga": "Rote Tengah",
    "Delha": "Rote Barat",
    "Eahun": "Rote Barat Laut",
    "Feapopi": "Rote Timur",
    "Korbafo": "Rote Timur",
    "Ndao": "Rote Barat Daya",
    "Oelaba": "Rote Barat Laut",
    "Oele": "Rote Selatan",
    "Sonimanu": "Rote Barat Daya",
    "Sotimori": "Rote Timur",
}


def set_kecamatan(apps, schema_editor):
    Puskesmas = apps.get_model("puskesmas", "Puskesmas")
    for nama, kecamatan in KECAMATAN_MAP.items():
        Puskesmas.objects.filter(nama=nama).update(kecamatan=kecamatan)


def unset_kecamatan(apps, schema_editor):
    Puskesmas = apps.get_model("puskesmas", "Puskesmas")
    Puskesmas.objects.filter(nama__in=KECAMATAN_MAP.keys()).update(kecamatan="")


class Migration(migrations.Migration):
    dependencies = [
        ("puskesmas", "0002_seed_puskesmas"),
    ]
    operations = [
        migrations.RunPython(set_kecamatan, unset_kecamatan),
    ]
