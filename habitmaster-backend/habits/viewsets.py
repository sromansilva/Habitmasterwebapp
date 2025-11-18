from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from controller.app_controller import HabitController
from .models import Achievement, Habit, HabitLog, UserProfile
from .serializers import (
    AchievementSerializer,
    HabitLogSerializer,
    HabitSerializer,
    UserProfileSerializer,
)


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Habit):
            return obj.user == request.user
        if isinstance(obj, HabitLog):
            return obj.habit.user == request.user
        if isinstance(obj, Achievement):
            return obj.user == request.user
        if isinstance(obj, UserProfile):
            return obj.user == request.user
        return False


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        try:
            controller = HabitController()
            result = controller.complete_habit(request.user, pk, timezone.localdate())
            return Response(result, status=status.HTTP_200_OK)
        except Habit.DoesNotExist:
            return Response(
                {'error': 'Hábito no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HabitLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HabitLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return HabitLog.objects.filter(habit__user=self.request.user).order_by('-date')


class UserProfileView(APIView):
    """
    Vista para obtener el perfil del usuario actual.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            controller = HabitController()
            logs = controller._get_user_log_dicts(request.user)
            streak = controller.get_dashboard_data(request.user).get('streak', 0)
            
            serializer = UserProfileSerializer(profile)
            data = serializer.data
            data['streak'] = streak
            data['username'] = request.user.username
            data['email'] = request.user.email
            
            return Response(data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            # Crear perfil si no existe
            profile = UserProfile.objects.create(user=request.user)
            serializer = UserProfileSerializer(profile)
            data = serializer.data
            data['streak'] = 0
            data['username'] = request.user.username
            data['email'] = request.user.email
            return Response(data, status=status.HTTP_200_OK)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user).order_by('-earned_on')


class RankingView(APIView):
    """
    Vista para obtener el ranking global de usuarios.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            controller = HabitController()
            ranking_data = controller.build_ranking_context()
            return Response(ranking_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e), 'ranking': []},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
