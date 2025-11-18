from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from controller.app_controller import HabitController
from habits.models import Habit


class Command(BaseCommand):
    help = "Carga datos iniciales para ambientes Supabase/Postgres"

    def handle(self, *args, **options):
        User = get_user_model()
        user, _ = User.objects.get_or_create(username="demo", defaults={"email": "demo@example.com"})
        user.set_password("demo1234")
        user.save()

        habits = [
            Habit.objects.get_or_create(
                user=user,
                name="Hidratarse",
                defaults={"description": "Tomar 2L de agua", "periodicity": Habit.Periodicity.DAILY, "points_value": 10},
            )[0],
            Habit.objects.get_or_create(
                user=user,
                name="Correr",
                defaults={"description": "Correr 5km", "periodicity": Habit.Periodicity.WEEKLY, "points_value": 25},
            )[0],
        ]

        controller = HabitController()
        today = timezone.localdate()
        for offset in range(3):
            controller.complete_habit(user, habits[0].id, today - timedelta(days=offset))

        controller.complete_habit(user, habits[1].id, today)

        self.stdout.write(self.style.SUCCESS("Seed completado. Usuario demo/demo1234 listo."))

