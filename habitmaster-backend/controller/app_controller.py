from dataclasses import asdict, dataclass
from datetime import date
from typing import Dict, List, Tuple

from django.db import transaction
from django.utils import timezone

from habits.models import Achievement, Habit, HabitLog, UserProfile
from logic_rules import rules
from processor import functional


@dataclass
class HabitCompletionResult:
    habit_id: int
    completed_on: date
    points_awarded: int
    achievements: List[str]
    level: int
    streak: int


class HabitController:
    """Coordinador imperativo entre vistas, reglas y funciones puras."""

    def _get_profile(self, user) -> UserProfile:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return profile

    @transaction.atomic
    def complete_habit(self, user, habit_id: int, completed_date: date | None = None) -> Dict:
        habit = Habit.objects.select_for_update().get(pk=habit_id, user=user)
        profile = self._get_profile(user)
        completed_date = completed_date or timezone.localdate()

        points = functional.calculate_points(habit, completed_date)
        log, _ = HabitLog.objects.update_or_create(
            habit=habit,
            date=completed_date,
            defaults={
                "completed": True,
                "points_awarded": points,
            },
        )

        profile.total_points += points
        streak = functional.calculate_streak(self._get_user_log_dicts(user))
        profile.current_streak = streak
        profile.longest_streak = max(profile.longest_streak, streak)
        profile.last_completed = completed_date

        achievements = rules.check_achievements(profile.current_streak)
        special = rules.check_special_streak(profile.current_streak)
        self._persist_achievements(user, achievements + special)
        level = rules.determine_level(profile.total_points)

        profile.level = level
        profile.save()

        result = HabitCompletionResult(
            habit_id=habit.id,
            completed_on=completed_date,
            points_awarded=points,
            achievements=achievements + special,
            level=level,
            streak=streak,
        )
        return asdict(result)

    def _persist_achievements(self, user, codes: List[str]) -> None:
        existing = set(user.achievements.values_list("code", flat=True))
        new_codes = [code for code in codes if code not in existing]
        Achievement.objects.bulk_create(
            [
                Achievement(user=user, code=code, name=code.replace("_", " ").title())
                for code in new_codes
            ]
        )

    def _get_user_log_dicts(self, user) -> List[Dict]:
        logs = HabitLog.objects.filter(habit__user=user).order_by("date")
        return [
            {
                "date": log.date,
                "completed": log.completed,
                "habit_id": log.habit_id,
                "points": log.points_awarded,
            }
            for log in logs
        ]

    def get_dashboard_data(self, user) -> Dict:
        """Obtiene el contexto completo para el dashboard."""
        try:
            profile = self._get_profile(user)
            logs = self._get_user_log_dicts(user)
            week_logs = functional.filter_logs_by_week(logs)
            streak = functional.calculate_streak(logs)
            habits = Habit.objects.filter(user=user)

            return {
                "habits": habits,
                "profile": profile,
                "streak": streak,
                "week_logs": week_logs,
                "achievements": rules.check_achievements(streak),
            }
        except Exception:
            # Retorna contexto mínimo si hay error
            profile = self._get_profile(user)
            return {
                "habits": [],
                "profile": profile,
                "streak": 0,
                "week_logs": [],
                "achievements": [],
            }

    def build_ranking_context(self) -> Dict[str, List[Tuple[str, int]]]:
        """Construye el contexto para el ranking global."""
        try:
            users = UserProfile.objects.select_related("user")
            ranking = functional.generate_ranking(users)
            return {"ranking": ranking}
        except Exception:
            return {"ranking": []}

    def get_profile_context(self, user) -> Dict:
        """Obtiene el contexto completo para la vista de perfil."""
        try:
            profile = self._get_profile(user)
            logs = self._get_user_log_dicts(user)
            streak = functional.calculate_streak(logs)
            habits = Habit.objects.filter(user=user)
            achievements_list = Achievement.objects.filter(user=user).order_by("-earned_on")
            
            return {
                "profile": profile,
                "streak": streak,
                "habits": habits,
                "achievements": achievements_list,
                "total_habits": habits.count(),
            }
        except Exception:
            # Retorna contexto mínimo si hay error
            profile = self._get_profile(user)
            return {
                "profile": profile,
                "streak": 0,
                "habits": [],
                "achievements": [],
                "total_habits": 0,
            }

    def get_progress_context(self, user) -> Dict:
        """Obtiene el contexto completo para la vista de progreso."""
        try:
            profile = self._get_profile(user)
            logs = self._get_user_log_dicts(user)
            week_logs = functional.filter_logs_by_week(logs)
            streak = functional.calculate_streak(logs)
            habits = Habit.objects.filter(user=user)
            
            return {
                "profile": profile,
                "week_logs": week_logs,
                "streak": streak,
                "habits": habits,
                "total_logs": len(logs),
            }
        except Exception:
            # Retorna contexto mínimo si hay error
            profile = self._get_profile(user)
            return {
                "profile": profile,
                "week_logs": [],
                "streak": 0,
                "habits": [],
                "total_logs": 0,
            }

