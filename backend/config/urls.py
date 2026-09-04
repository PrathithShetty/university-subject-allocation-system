from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/",
        include("apps.academics.urls"),
    ),

    path(
        "api/staff/",
        include("apps.staff.urls"),
    ),

    path(
        "api/accounts/",
        include("apps.accounts.urls"),
    ),

    path(
        "api/allocation/",
        include("apps.allocation.urls"),
    ),

    path(
        "api/preferences/",
        include("apps.preferences.urls"),
    ),
]