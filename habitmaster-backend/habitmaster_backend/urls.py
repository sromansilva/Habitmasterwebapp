"""
URL configuration for habitmaster_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ui.views import ReactAppView

urlpatterns = [
    # --- Admin ---
    path("admin/", admin.site.urls),
    
    # --- JWT API ---
    path("api/auth/login/", TokenObtainPairView.as_view(), name="jwt-login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    # Compatibilidad con rutas alternativas
    path("auth/login/", TokenObtainPairView.as_view(), name="jwt-login-alt"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="jwt-refresh-alt"),

    # --- API ---
    path("api/", include("habits.urls")),

    # --- Docs ---
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),

    # --- React SPA (catch-all) ---
    # Debe ir al final para capturar todas las rutas que no sean API o admin
    re_path(r'^(?!api|admin|static|media).*$', ReactAppView.as_view(), name='react-app'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Serve React build assets (CSS, JS, images from build/assets/)
    build_dir = settings.BASE_DIR.parent / 'build'
    if build_dir.exists():
        from django.views.static import serve
        urlpatterns += [
            re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': build_dir / 'assets'}),
        ]
