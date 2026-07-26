from rest_framework import serializers

from .models import (
    Designation,
    Faculty,
)


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = "__all__"


class FacultySerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Faculty
        fields = "__all__"