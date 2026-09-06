from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

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
    permission_classes = [IsAuthenticated]
    queryset = PreferenceCycle.objects.all()
    serializer_class = PreferenceCycleSerializer


class PreferenceCycleDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = PreferenceCycle.objects.all()
    serializer_class = PreferenceCycleSerializer


class FacultyPreferenceListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = FacultyPreference.objects.all()
    serializer_class = FacultyPreferenceSerializer


class FacultyPreferenceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = FacultyPreference.objects.all()
    serializer_class = FacultyPreferenceSerializer


class PreferredSectionListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = PreferredSection.objects.all()
    serializer_class = PreferredSectionSerializer


class PreferredSectionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = PreferredSection.objects.all()
    serializer_class = PreferredSectionSerializer


class PreferredTimeSlotListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = PreferredTimeSlot.objects.all()
    serializer_class = PreferredTimeSlotSerializer


class PreferredTimeSlotDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = PreferredTimeSlot.objects.all()
    serializer_class = PreferredTimeSlotSerializer


class FacultyAvailabilityListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = FacultyAvailability.objects.all()
    serializer_class = FacultyAvailabilitySerializer


class FacultyAvailabilityDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = FacultyAvailability.objects.all()
    serializer_class = FacultyAvailabilitySerializer


class WorkloadPreferenceListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = WorkloadPreference.objects.all()
    serializer_class = WorkloadPreferenceSerializer


class WorkloadPreferenceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]
    queryset = WorkloadPreference.objects.all()
    serializer_class = WorkloadPreferenceSerializer
