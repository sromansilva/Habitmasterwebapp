from django.contrib import admin

from .models import Achievement, Habit, HabitLog, UserProfile


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "periodicity", "points_value", "difficulty")
    search_fields = ("name", "user__username")
    list_filter = ("periodicity", "difficulty")


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ("habit", "date", "completed", "points_awarded")
    search_fields = ("habit__name", "habit__user__username")
    list_filter = ("completed",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "total_points", "current_streak", "longest_streak")
    search_fields = ("user__username",)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "name", "earned_on")
    search_fields = ("user__username", "code")
