import React from "react";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Bell, 
  Globe, 
  Moon, 
  Shield, 
  Trash2, 
  LogOut,
  Info,
  Check
} from 'lucide-react';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  onLogout: () => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/settings/ - Obtener preferencias del usuario
 * - PUT /api/settings/ - Actualizar preferencias
 * - POST /api/auth/logout/ - Cerrar sesión
 * - DELETE /api/account/ - Eliminar cuenta (requiere confirmación)
 * 
 * Campos de configuración (pueden estar en Profile o modelo Settings):
 * - notificaciones_email (Boolean)
 * - notificaciones_push (Boolean)
 * - zona_horaria (CharField)
 * - idioma (CharField)
 * - tema_oscuro (Boolean)
 * 
 * Validaciones:
 * - Zona horaria válida (usar pytz.all_timezones)
 * - Idioma soportado
 */

export function Settings({ darkMode, onDarkModeChange, onLogout }: SettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: darkMode,
    timezone: 'America/Mexico_City',
    language: 'es',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    // Backend: PUT /api/settings/
    console.log('Save settings:', settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    // Backend: DELETE /api/account/
    // Mostrar modal de confirmación antes
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      console.log('Delete account');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-neutral-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Gestiona tus preferencias y configuración de la cuenta
        </p>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <Alert className="alert-success mb-6 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            Configuración guardada exitosamente
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Notifications */}
        <Card className="card-settings-section">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo quieres recibir notificaciones
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificaciones por email</Label>
                <p className="text-sm text-neutral-500">
                  Recibe recordatorios y actualizaciones por correo
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
                className="switch-setting"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificaciones push</Label>
                <p className="text-sm text-neutral-500">
                  Recibe alertas en tiempo real en el navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
                className="switch-setting"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-settings-section">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                  Personaliza cómo se ve HabitMaster
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo oscuro</Label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Cambia a un tema oscuro para tus ojos
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, darkMode: checked });
                  onDarkModeChange(checked);
                }}
                className="switch-setting"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="card-settings-section">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Región e idioma</CardTitle>
                <CardDescription>
                  Configura tu zona horaria e idioma preferido
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger id="timezone" className="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-neutral-500">
                Se usa para programar recordatorios y calcular rachas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger id="language" className="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="card-settings-section">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Privacidad y seguridad</CardTitle>
                <CardDescription>
                  Gestiona tu cuenta y datos personales
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-900 mb-1">Cambiar contraseña</p>
                <p className="text-sm text-neutral-500 mb-3">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
                <Button variant="outline" size="sm" className="btn-change-password">
                  Cambiar contraseña
                </Button>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-900 mb-1">Descargar mis datos</p>
                <p className="text-sm text-neutral-500 mb-3">
                  Obtén una copia de toda tu información
                </p>
                <Button variant="outline" size="sm" className="btn-download-data">
                  Descargar datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="btn-save-settings gap-2">
            <Check className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="card-danger-zone border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Zona de peligro</CardTitle>
            <CardDescription className="text-red-700">
              Acciones irreversibles que afectan tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-neutral-900 mb-1">Cerrar sesión</p>
                <p className="text-sm text-neutral-600">
                  Salir de tu cuenta en este dispositivo
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="btn-logout gap-2 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </div>

            <div className="pt-4 border-t border-red-200 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-red-900 mb-1">Eliminar cuenta</p>
                <p className="text-sm text-red-700">
                  Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
                </p>
              </div>
              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                className="btn-delete-account gap-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}