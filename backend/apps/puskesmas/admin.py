from django.contrib import admin
from .models import Puskesmas


@admin.register(Puskesmas)
class PuskesmasAdmin(admin.ModelAdmin):
    list_display = ("nama", "kode", "kecamatan", "aktif")
    search_fields = ("nama", "kode")
