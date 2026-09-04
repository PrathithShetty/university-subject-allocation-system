from django.urls import path

from .views import (
    AllocationConflictListView,
    AllocationListView,
    AllocationRunDetailView,
    AllocationRunExecuteView,
    AllocationRunListCreateView,
)


urlpatterns = [
    path(
        "runs/",
        AllocationRunListCreateView.as_view(),
        name="allocation-run-list-create",
    ),

    path(
        "runs/<int:pk>/",
        AllocationRunDetailView.as_view(),
        name="allocation-run-detail",
    ),

    path(
        "runs/<int:pk>/execute/",
        AllocationRunExecuteView.as_view(),
        name="allocation-run-execute",
    ),

    path(
        "runs/<int:pk>/allocations/",
        AllocationListView.as_view(),
        name="allocation-list",
    ),

    path(
        "runs/<int:pk>/conflicts/",
        AllocationConflictListView.as_view(),
        name="allocation-conflict-list",
    ),
]