from rest_framework import viewsets

from ..models import AcademicYear, Department
from ..serializers import (
    AcademicYearSerializer,
    DepartmentSerializer,
)


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer