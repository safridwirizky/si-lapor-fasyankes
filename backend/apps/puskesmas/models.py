from django.db import models


class Puskesmas(models.Model):
    nama = models.CharField(max_length=150, unique=True)
    kode = models.CharField(max_length=20, unique=True, blank=True, null=True)
    kecamatan = models.CharField(max_length=100, blank=True)
    aktif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nama"]
        verbose_name_plural = "Puskesmas"

    def __str__(self):
        return self.nama
