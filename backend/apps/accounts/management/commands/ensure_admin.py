import os

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    """
    Creates a superuser from DJANGO_SUPERUSER_USERNAME /
    DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD environment
    variables, if one with that username doesn't already exist.

    Safe to run on every deploy (e.g. as part of the start command on a
    host with no shell access, like Render's free tier) - it is a no-op
    once the account exists.
    """

    help = (
        "Idempotently creates a superuser from DJANGO_SUPERUSER_* "
        "environment variables."
    )

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write(
                "DJANGO_SUPERUSER_USERNAME/DJANGO_SUPERUSER_PASSWORD "
                "not set - skipping admin creation."
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                f"Superuser '{username}' already exists - skipping."
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(f"Created superuser '{username}'.")
        )
