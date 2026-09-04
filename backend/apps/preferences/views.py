from rest_framework import generics

from .models import (
    PreferenceCycle,
    FacultyPreference,
    PreferredSection,
    PreferredTimeSlot,
    FacultyAvailability,
    WorkloadPreference,
)

from .serializers import (
    PreferenceCycleSerializer,
    FacultyPreferenceSerializer,
    PreferredSectionSerializer,
    PreferredTimeSlotSerializer,
    FacultyAvailabilitySerializer,
    WorkloadPreferenceSerializer,
)


class PreferenceCycleListCreateView(
    generics.ListCreateAPIView
):
    queryset = PreferenceCycle.objects.all()
    serializer_class = PreferenceCycleSerializer


class FacultyPreferenceListCreateView(
    generics.ListCreateAPIView
):
    queryset = FacultyPreference.objects.all()
    serializer_class = FacultyPreferenceSerializer


class PreferredSectionListCreateView(
    generics.ListCreateAPIView
):
    queryset = PreferredSection.objects.all()
    serializer_class = PreferredSectionSerializer


class PreferredTimeSlotListCreateView(
    generics.ListCreateAPIView
):
    queryset = PreferredTimeSlot.objects.all()
    serializer_class = PreferredTimeSlotSerializer


class FacultyAvailabilityListCreateView(
    generics.ListCreateAPIView
):
    queryset = FacultyAvailability.objects.all()
    serializer_class = FacultyAvailabilitySerializer


class WorkloadPreferenceListCreateView(
    generics.ListCreateAPIView
):
    queryset = WorkloadPreference.objects.all()
    serializer_class = WorkloadPreferenceSerializer