from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from controller.app_controller import HabitController
from logic_rules import rules
from processor import functional
from .models import Habit, HabitLog


class FunctionalModuleTests(TestCase):
    def test_calculate_points_applies_weekend_bonus(self):
        User = get_user_model()
        user = User.objects.create(username="tester")
        habit = Habit.objects.create(user=user, name="Leer", points_value=10, difficulty=Habit.Difficulty.HARD)
        saturday = date(2024, 12, 7)
        points = functional.calculate_points(habit, saturday)
        self.assertGreaterEqual(points, 15)

    def test_streak_reduce(self):
        logs = [
            {"date": date(2024, 12, 1), "completed": True},
            {"date": date(2024, 12, 2), "completed": True},
            {"date": date(2024, 12, 4), "completed": True},
        ]
        streak = functional.calculate_streak(logs)
        self.assertEqual(streak, 2)


class ControllerTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="demo", password="demo1234")
        self.habit = Habit.objects.create(user=self.user, name="Meditación", points_value=10)
        self.controller = HabitController()

    def test_complete_habit_creates_log_and_updates_profile(self):
        today = timezone.localdate()
        result = self.controller.complete_habit(self.user, self.habit.id, today)
        self.assertTrue(HabitLog.objects.filter(habit=self.habit, date=today, completed=True).exists())
        self.assertGreater(result["points_awarded"], 0)
        self.assertIn("streak", result)


class LogicRulesTests(TestCase):
    def test_rules_return_medals(self):
        medals = rules.check_achievements(30)
        self.assertIn("medalla_30", medals)
