from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicYearViewSet,
    DepartmentViewSet,
    ProgramViewSet,
    SemesterViewSet,
    SectionViewSet,
)

router = DefaultRouter()

router.register(
    r"academic-years",
    AcademicYearViewSet,
    basename="academic-year",
)

router.register(
    r"departments",
    DepartmentViewSet,
    basename="department",
)

router.register(
    r"programs",
    ProgramViewSet,
    basename="program",
)

router.register(
    r"semesters",
    SemesterViewSet,
    basename="semester",
)

router.register(
    r"sections",
    SectionViewSet,
    basename="section",
)

urlpatterns = [
    path("", include(router.urls)),
]