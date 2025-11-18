from __future__ import annotations

from typing import List

from kanren import Relation, facts, run, var

earned = Relation()
special = Relation()
levels = Relation()

facts(
    earned,
    ("medalla_7", 7),
    ("medalla_14", 14),
    ("medalla_30", 30),
    ("medalla_90", 90),
)

facts(
    special,
    ("racha_semana", 7),
    ("racha_mes", 30),
)

facts(
    levels,
    ("nivel_1", 0),
    ("nivel_2", 200),
    ("nivel_3", 500),
    ("nivel_4", 900),
    ("nivel_5", 1500),
)


def check_achievements(streak: int) -> List[str]:
    x, threshold = var(), var()
    possible = run(0, (x, threshold), earned(x, threshold))
    return [name for name, required in possible if streak >= required]


def check_special_streak(streak: int) -> List[str]:
    x, threshold = var(), var()
    possible = run(0, (x, threshold), special(x, threshold))
    return [name for name, required in possible if streak == required]


def determine_level(total_points: int) -> int:
    x, threshold = var(), var()
    possible = run(0, (x, threshold), levels(x, threshold))
    eligible = [idx + 1 for idx, (_, required) in enumerate(possible) if total_points >= required]
    return eligible[-1] if eligible else 1


def achieved_set(streak: int, total_points: int) -> List[str]:
    """Regla declarativa que combina logros alcanzados."""
    return sorted(set(check_achievements(streak) + check_special_streak(streak) + [f"nivel_{determine_level(total_points)}"]))

