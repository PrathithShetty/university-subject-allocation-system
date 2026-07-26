from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DesignationViewSet,
    FacultyViewSet,
)

router = DefaultRouter()

router.register(
    r"designations",
    DesignationViewSet,
    basename="designation",
)

router.register(
    r"faculties",
    FacultyViewSet,
    basename="faculty",
)

urlpatterns = [
    path("", include(router.urls)),
]