from django.db import models
from django.core.validators import MinValueValidator
from apps.puskesmas.models import Puskesmas


class KunjunganRecord(models.Model):
    puskesmas = models.ForeignKey(Puskesmas, on_delete=models.PROTECT, related_name="kunjungan_records")
    bulan = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])  # 1-12
    tahun = models.PositiveSmallIntegerField()

    jumlah_kunjungan_baru = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    jumlah_kunjungan_lama = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    jumlah_kunjungan_bpjs = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    jumlah_kunjungan_umum = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["puskesmas", "bulan", "tahun"],
                name="unique_kunjungan_per_periode",
            )
        ]
        ordering = ["-tahun", "-bulan", "puskesmas__nama"]

    def __str__(self):
        return f"{self.puskesmas} - {self.bulan}/{self.tahun}"
