from rest_framework import serializers
from .models import Puskesmas


class PuskesmasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puskesmas
        fields = ["id", "nama", "kode", "kecamatan", "aktif", "created_at", "updated_at"]
