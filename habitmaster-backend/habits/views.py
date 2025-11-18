"""
Views para autenticación y registro de usuarios
"""
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from habits.models import UserProfile

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registro de nuevo usuario.
    Crea User y UserProfile automáticamente.
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    password_confirm = request.data.get('password_confirm') or request.data.get('password2')

    # Validaciones básicas
    if not username or not email or not password:
        return Response(
            {'error': 'Username, email y password son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password_confirm and password != password_confirm:
        return Response(
            {'error': 'Las contraseñas no coinciden'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'El usuario ya existe'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'El email ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Crear usuario
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        # El signal debería crear el UserProfile automáticamente
        # Pero lo creamos explícitamente por si acaso
        UserProfile.objects.get_or_create(user=user)

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': f'Error al crear usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
