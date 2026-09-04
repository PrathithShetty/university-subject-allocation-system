from django.urls import path

from .views import (
    PreferenceCycleListCreateView,
    FacultyPreferenceListCreateView,
    PreferredSectionListCreateView,
    PreferredTimeSlotListCreateView,
    FacultyAvailabilityListCreateView,
    WorkloadPreferenceListCreateView,
)


urlpatterns = [
    path(
        "preference-cycles/",
        PreferenceCycleListCreateView.as_view(),
        name="preference-cycle-list-create",
    ),

    path(
        "faculty-preferences/",
        FacultyPreferenceListCreateView.as_view(),
        name="faculty-preference-list-create",
    ),

    path(
        "preferred-sections/",
        PreferredSectionListCreateView.as_view(),
        name="preferred-section-list-create",
    ),

    path(
        "preferred-time-slots/",
        PreferredTimeSlotListCreateView.as_view(),
        name="preferred-time-slot-list-create",
    ),

    path(
        "faculty-availability/",
        FacultyAvailabilityListCreateView.as_view(),
        name="faculty-availability-list-create",
    ),

    path(
        "workload-preferences/",
        WorkloadPreferenceListCreateView.as_view(),
        name="workload-preference-list-create",
    ),
]