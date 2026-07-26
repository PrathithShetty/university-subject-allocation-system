from rest_framework import viewsets

from .models import (
    Designation,
    Faculty,
)

from .serializers import (
    DesignationSerializer,
    FacultySerializer,
)


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer