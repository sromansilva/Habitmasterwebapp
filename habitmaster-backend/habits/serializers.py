from rest_framework import serializers

from .models import Achievement, Habit, HabitLog, UserProfile


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ("id", "name", "description", "periodicity", "points_value", "difficulty", "created_at")
        read_only_fields = ("id", "created_at")


class HabitLogSerializer(serializers.ModelSerializer):
    habit = HabitSerializer(read_only=True)

    class Meta:
        model = HabitLog
        fields = ("id", "habit", "date", "completed", "points_awarded", "note")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("level", "total_points", "current_streak", "longest_streak", "last_completed")


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ("code", "name", "earned_on")

