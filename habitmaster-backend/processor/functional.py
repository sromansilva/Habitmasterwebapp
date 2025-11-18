from __future__ import annotations

from datetime import date, timedelta
from functools import reduce
from typing import Iterable, List, Sequence


def calculate_points(habit, completed_date: date) -> int:
    """Función pura que calcula puntos según dificultad y día."""
    difficulty_bonus = {
        "easy": 0,
        "medium": 2,
        "hard": 5,
    }.get(getattr(habit, "difficulty", "medium"), 0)

    weekend_bonus = 3 if completed_date.weekday() >= 5 else 0
    base = getattr(habit, "points_value", 10)
    return base + difficulty_bonus + weekend_bonus


def calculate_streak(logs: Sequence[dict]) -> int:
    """Reduce puro que determina la racha consecutiva más alta."""
    if not logs:
        return 0

    sorted_logs = sorted(logs, key=lambda log: log["date"])

    def reducer(state, log):
        last_date, current, best = state
        if not log["completed"]:
            return log["date"], 0, max(best, current)
        if last_date and (log["date"] - last_date) == timedelta(days=1):
            current += 1
        else:
            current = 1
        best = max(best, current)
        return log["date"], current, best

    _, _, best = reduce(reducer, sorted_logs, (None, 0, 0))
    return best


def filter_logs_by_week(logs: Iterable[dict], reference: date | None = None) -> List[dict]:
    """Filtra logs para la semana actual usando filter."""
    reference = reference or date.today()
    week_start = reference - timedelta(days=reference.weekday())
    week_end = week_start + timedelta(days=6)
    return list(
        filter(
            lambda log: week_start <= log["date"] <= week_end,
            logs,
        )
    )


def generate_ranking(users: Iterable) -> List[tuple]:
    """Genera ranking usando sorted + map."""
    sorted_users = sorted(users, key=lambda profile: profile.total_points, reverse=True)
    return list(
        map(
            lambda profile: (
                profile.user.username,
                profile.total_points,
            ),
            sorted_users,
        )
    )

