from django.conf import settings
from django.db import models


class Habit(models.Model):
    class Periodicity(models.TextChoices):
        DAILY = "daily", "Diario"
        WEEKLY = "weekly", "Semanal"
        CUSTOM = "custom", "Personalizado"

    class Difficulty(models.TextChoices):
        EASY = "easy", "Fácil"
        MEDIUM = "medium", "Media"
        HARD = "hard", "Difícil"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    periodicity = models.CharField(max_length=12, choices=Periodicity.choices, default=Periodicity.DAILY)
    points_value = models.PositiveIntegerField(default=10)
    difficulty = models.CharField(max_length=12, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.user})"


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField()
    completed = models.BooleanField(default=False)
    points_awarded = models.IntegerField(default=0)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("habit", "date")
        ordering = ("-date",)

    def __str__(self) -> str:
        return f"{self.habit.name} - {self.date}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    level = models.PositiveIntegerField(default=1)
    total_points = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_completed = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Perfil {self.user.username}"


class Achievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="achievements")
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=120)
    earned_on = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "code")

    def __str__(self) -> str:
        return f"{self.user.username} - {self.name}"
