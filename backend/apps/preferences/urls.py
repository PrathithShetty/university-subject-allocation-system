from django.urls import path

from .views import (
    PreferenceCycleListCreateView,
    PreferenceCycleDetailView,
    FacultyPreferenceListCreateView,
    FacultyPreferenceDetailView,
    PreferredSectionListCreateView,
    PreferredSectionDetailView,
    PreferredTimeSlotListCreateView,
    PreferredTimeSlotDetailView,
    FacultyAvailabilityListCreateView,
    FacultyAvailabilityDetailView,
    WorkloadPreferenceListCreateView,
    WorkloadPreferenceDetailView,
)


urlpatterns = [
    path(
        "preference-cycles/",
        PreferenceCycleListCreateView.as_view(),
        name="preference-cycle-list-create",
    ),
    path(
        "preference-cycles/<int:pk>/",
        PreferenceCycleDetailView.as_view(),
        name="preference-cycle-detail",
    ),

    path(
        "faculty-preferences/",
        FacultyPreferenceListCreateView.as_view(),
        name="faculty-preference-list-create",
    ),
    path(
        "faculty-preferences/<int:pk>/",
        FacultyPreferenceDetailView.as_view(),
        name="faculty-preference-detail",
    ),

    path(
        "preferred-sections/",
        PreferredSectionListCreateView.as_view(),
        name="preferred-section-list-create",
    ),
    path(
        "preferred-sections/<int:pk>/",
        PreferredSectionDetailView.as_view(),
        name="preferred-section-detail",
    ),

    path(
        "preferred-time-slots/",
        PreferredTimeSlotListCreateView.as_view(),
        name="preferred-time-slot-list-create",
    ),
    path(
        "preferred-time-slots/<int:pk>/",
        PreferredTimeSlotDetailView.as_view(),
        name="preferred-time-slot-detail",
    ),

    path(
        "faculty-availability/",
        FacultyAvailabilityListCreateView.as_view(),
        name="faculty-availability-list-create",
    ),
    path(
        "faculty-availability/<int:pk>/",
        FacultyAvailabilityDetailView.as_view(),
        name="faculty-availability-detail",
    ),

    path(
        "workload-preferences/",
        WorkloadPreferenceListCreateView.as_view(),
        name="workload-preference-list-create",
    ),
    path(
        "workload-preferences/<int:pk>/",
        WorkloadPreferenceDetailView.as_view(),
        name="workload-preference-detail",
    ),
]
