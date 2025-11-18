from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import register
from .viewsets import (
    AchievementViewSet,
    HabitLogViewSet,
    HabitViewSet,
    RankingView,
    UserProfileView,
)

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'logs', HabitLogViewSet, basename='habit-log')
router.register(r'achievements', AchievementViewSet, basename='achievement')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register, name='register'),
    # Profile and ranking
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('ranking/', RankingView.as_view(), name='ranking'),
    # Router endpoints
    path('', include(router.urls)),
]

