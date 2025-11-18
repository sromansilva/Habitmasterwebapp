"""
Views for serving React SPA in production.
All UI rendering is now handled by React frontend.
"""
from django.http import HttpResponse
from django.views.generic import TemplateView
from pathlib import Path


class ReactAppView(TemplateView):
    """
    Vista catch-all que sirve el index.html de React.
    Todas las rutas que no sean /api/*, /admin/*, /static/* o /media/* 
    serán manejadas por React (client-side routing).
    """
    template_name = 'index.html'
    
    def get(self, request, *args, **kwargs):
        """
        Sirve el index.html de React para cualquier ruta que no sea API o admin.
        """
        # Buscar el template en el directorio de build
        build_dir = Path(__file__).resolve().parent.parent.parent.parent / 'build'
        template_path = build_dir / 'index.html'
        
        if template_path.exists():
            # Leer el contenido del index.html del build
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Reemplazar rutas de assets si es necesario
            # Vite genera rutas relativas, así que deberían funcionar directamente
            return HttpResponse(content, content_type='text/html')
        else:
            # Si no existe el build, devolver HTML básico con mensaje
            html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HabitMaster - Build no encontrado</title>
            </head>
            <body>
                <h1>Build de React no encontrado</h1>
                <p>Por favor ejecuta: <code>npm run build</code> para generar el build de producción.</p>
                <p>O ejecuta: <code>npm run dev</code> para desarrollo.</p>
            </body>
            </html>
            """
            return HttpResponse(html, content_type='text/html')
